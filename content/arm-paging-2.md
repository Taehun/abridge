+++
title = "ARM Cortex-A 페이징"
date = 2013-06-02
draft = false

[taxonomies]
tags = ['Embedded', 'Cortex-A', '운영체제']

[extra]
author = "김태훈"
toc = true
+++

## 페이징

우리가 사용하는 어플리케이션은 모두 **가상 주소(Virtual address)**라는 실제 물리 메모리의 주소가 아닌 논리적 메모리 주소를 사용합니다. 그럼 이 가상 주소를 실제 메모리의 주소인 **물리 주소(Physical Address)**로 변환해야 할 필요가 있는데, 이러한 가상 주소를 물리 주소로 변환하는 매커니즘을 **페이징(Paging)**이라고 합니다. 페이징은 가상 주소를 사용하는 시스템이면 메모리 접근시마다 해야하므로 비교적 많은 오버헤드가 걸립니다. 그래서 페이징을 사용하는 시스템은 모두 CPU에 포함된 **MMU(Memory Management Unit)**에서 하드웨어적으로 처리하게 됩니다.


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Ff51f3da2-15e6-4780-a084-c442bc2180b3%2FUntitled.png?table=block&id=149be922-2d46-4e91-bd87-48ed5baf1ace&cache=v2 -->

![&lt;그림 1. 가상 주소와 물리 주소&gt;](https://img-src.io/taehun/arm-paging-2/1.png)


**<그림 1. 가상 주소와 물리 주소>**

어플리케이션을 좀 더 명확히 구분하기 위하여 컴퓨터 과학 분야에서 사용하는 용어로 바꾸겠습니다. 하드 디스크나 플래시 메모리등의 보조기억장치에서 실행가능한 파일 형태로 존재하는 프로그램(Program)을 실행 하기 위해 메모리 로드된 것을 프로세스(Process)라고 합니다. 모든 프로세스는 힙(Heap), 스택(Stack), 데이터(Data), 코드(Code)등의 영역을 가지고 있고 이것은 동일한 가상 주소를 사용합니다. <그림 1>에서 왼쪽 부분이 프로세스가 사용하는 가상 주소 공간의 메모리 맵을 나타냅니다. 하지만 실제 물리 메모리 주소는 <그림 1>의 오른쪽 부분처럼 되어 있습니다. 데이터를 저장하는 RAM 영역과 읽기만 가능한 ROM 영역,**MMIO(Memory Mapped I/O)**로 디바이스 I/O를 하기 위한 Peripheral 영역등이 물리 메모리 주소 공간에 존재합니다. 각 프로세스가 사용하는 가상 메모리 영역은 동일하지만 이것은 실제로는 각각 다른 물리 메모리 영역을 사용합니다. 물론, 커널 영역등의 시스템에서 전역적으로 사용하는 메모리 영역은 모든 프로세스가 같은 가상 주소에 같은 물리 주소가 매핑되어 있습니다.

사용자는 메모리를 연속된 공간으로 인식하여 사용하지만, 실제로 메모리를 관리하는 주체인 운영체제 커널이나 CPU는 메모리를 일정한 크기의 블록 단위로 관리합니다. 가상 메모리 공간을 일정한 크기로 나눈 것을 **페이지(Page)**물리 메모리 공간을 일정한 크기로 나눈 것을**프레임(Frame)**혹은 **페이지 프레임(Page Frame)**이라고 합니다. 페이지와 페이지 프레임은 페이징 단위가 되므로 기억해 둡시다. 페이지와 프레임의 크기는 동일한 크기를 사용하며 일반적으로 4KB를 많이 사용하지만, 용도에 따라 다양한 크기로 설정 가능 합니다.

페이징을 하기 위해서는 **페이지 테이블(Page Table)**이라는 가상 주소를 물리 주소로 변환하는 정보를 담고 있는 변환 테이블이 필요 합니다. 페이지 테이블은 메모리 공간 효율성 등의 이유로 여러 단계로 이루어져 있습니다. 운영체제 커널과 같은 시스템 프로그램은 초기화 과정에서 페이지 테이블을 작성하고, MMU에 페이지 테이블의 주소를 알려줍니다. 그리고 페이징을 활성화하게 되면 이제부터 MMU가 페이지 테이블을 참조하여 주소 변환을 하게 되므로 물리 주소가 아닌 가상 주소를 사용하게 되는 것 입니다. 페이징을 활성화하는 전반적인 흐름은 모두 이와 같습니다만 세부적인 방법은 아키텍처마다 모두 다릅니다. 이제부터 우리가 스마트폰이나 태블릿 PC등으로 널리 사용 중인 ARM Cortex-A 아키텍처의 페이징에 대해 알아 보겠습니다.

## **ARM Cortex-A 페이징**

ARM 아키텍처를 처음 배우시는 분들은 ARM System Developer's Guide라는 걸출한 ARM 아키텍처 서적 때문에 ARM9 아키텍처(ARMv4 코어)로 공부하시는 분들이 많습니다. 애석하게도 ARM Cortex-A가 사용하는 ARMv7-A 코어는 ARMv4 코어에서 페이징 루틴이 변경되었으므로 유의해야 합니다.

ARM Cortex-A는 1단계 혹은 2단계 페이징을 지원합니다. 1단계 페이징은 1MB 페이지와 16MB 페이지를 지원합니다. 2단계 페이징은 4KB 페이지와 16KB 페이지를 지원합니다. 다양한 크기의 페이지를 용도에 따라 적절한 페이지 크기를 설정해서 사용 할 수 있습니다. 페이지 크기를 4KB로 하는 이유는 많이 알려져 있으니 페이지 크기를 크게 설정했을때 얻게되는 이점이 무엇인지 한번 알아 보겠습니다.

주소 변환은 CPU의 MMU에서 하드웨어적으로 처리한다고 하더라도 MMU가 주소 변환을 하기 위해서는 페이지 테이블을 참조해야 합니다. 즉, 페이징이 활성화 되어 가상 주소에 해당되는 물리 주소로 변환하려면 페이지 테이블을 참조하기 위해 메모리에 접근을 해야 한다는 것입니다. 1단계 페이징이면 1번의 메모리 접근을 하고, 2단계 페이징은 2번의 메모리 접근을 합니다. 당연히 메모리 접근 횟수가 늘어 날 수록 페이징에 걸리는 오버헤드가 커지게 됩니다. 페이지 크기를 크게 설정하면 페이징 단계가 줄어들게 되므로 MMU가 페이지 테이블을 참조하기 위해 메모리 접근 횟수를 줄일수 있다는 점이 첫번째 이점입니다.마찬가지로 페이지 테이블 메모리 영역의 접근 횟수를 줄이기 위해 **TLB(Translation Lookaside Buffer)**라는 가상 주소를 물리 주소로 변환한 내용을 캐싱하는 캐시를 사용합니다. 최초에 가상 주소에 접근할때는 페이지 테이블을 참조하여 물리 주소로 변환합니다. 가상 주소를 물리 주소로 변환하는 작업이 완료되면 TLB에 <페이지 주소, 프레임 주소> 쌍으로 기입해두고 다음번에 동일한 페이지의 가상 주소를 접근할 시에는 TLB에 캐싱된 정보를 참조하여 곧바로 해당 물리 주소에 접근 하게 됩니다. 운영체제가 실행 도중에 문맥 교환(Context Switch)이 발생해 다른 프로세스로 전환 하게 되면 TLB에 저장된 가상 주소의 엔트리는 이전 프로세스가 사용하던 메모리 공간이 됩니다. 그래서 TLB의 캐싱 정보는 더이상 유효하지 않으므로 비워주어야 합니다.

주목해야 할 점은 TLB 크기는 한정적이라는 것입니다. 그래서 페이지 크기 단위가 클 수록 TLB에 많은 메모리 주소 영역을 캐싱 할 수 있습니다. 예를 들어, TLB에 10개의 엔트리만 저장 할 수 있다고 가정하면 1MB 페이지는 10MB 메모리 영역만 TLB에 캐싱 할 수 있습니다. 반면에 16MB 페이지는 160MB 메모리 영역을 TLB에 캐싱 할 수 있습니다. 이것이 페이지 크기를 크게 했을때 생기는 두번째 이점입니다.

ARMv7-A의 페이징은 크게 Short-descriptor translation과 Long-descriptor translation 두 종류로 나뉩니다. Long-descriptor translation은 큰 물리 메모리를 지원하는 LPAE(Large Physical Address Extension) 기능을 위한 것이므로 여기서는 Short-descriptor translation만 다루도록 하겠습니다.

앞서 ARM은 다양한 크기의 페이지를 사용할 수 있다고 하였습니다. 페이지 크기에 따라 다음과 같이 분류할 수 있습니다.

- Supersection: 16MB 크기를 가진 페이지입니다. (1단계 페이징)

- Section: 1MB 크기를 가진 페이지입니다. (1단계 페이징)

- Large Page: 64KB 크기를 가진 페이지입니다. (2단계 페이징)

- Small Page: 4KB 크기를 가진 페이지입니다. (2단계 페이징)

## **1 단계 페이징**

1단계 페이지 테이블의 기본 주소는 코프로세서 CP15 c2 레지스터에 저장 되어 있습니다(페이징 초기화 루틴에서 설정합니다.). 1단계 페이지 테이블은 **L1 페이지 테이블(Level 1 Page Table)**라고 많이 부르니 앞으로 L1 페이지 테이블이라고 하겠습니다.


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fd180bd20-bcef-46f4-9f8a-bc0e3bcda964%2FUntitled.png?table=block&id=ef62677b-7447-4f7c-82a8-7dbf4eddcf1a&cache=v2 -->

![&lt;그림 2. 1단계 페이징&gt;](https://img-src.io/taehun/arm-paging-2/2.png)


**<그림 2. 1단계 페이징>**

<그림 2>은 ARM Cortex-A의 1단계 페이징 과정을 나타냅니다. <그림 2>의 TTBA(Translation Table Base Address)는 L1 페이지 테이블의 시작 주소를 나타냅니다. TTBA의 상위 18비트에서 L1 페이지 테이블 시작 주소를 구하고, 여기에서 변환하고자 하는 가상 주소의 상위 12비트를 인덱스로 사용해서 **L1 페이지 테이블 엔트리(L1 Page Table Entry)**의 주소를 구합니다. <그림 2>의 'First Level Descriptor Address'가 이에 해당합니다. 0x000부터 0xfff까지 12비트를 인덱스로 사용하므로 L1 페이지 테이블의 엔트리의 갯수는 총 4096개가 됩니다. 이제 MMU는 메모리에서 L1 페이지 테이블 엔트리를 가져 옵니다(<그림 2>의 'Section Base Address Descriptor'). L1 페이지 테이블의 엔트리에는 가상 주소에 해당하는 페이지 프레임의 물리 주소가 저장되어 있습니다. 현재는 1MB 페이지를 예로 든것이므로 상위 12비트(1MB 단위)를 페이지 프레임의 주소로 사용합니다. 마지막으로 가상 주소의 하위 20비트를 페이지 프레임내의 오프셋으로 사용하면 가상 주소에 해당하는 물리 주소를 구할 수 있습니다.

이해를 돕기 위해 예를 들어 보겠습니다. 가상 주소는 0xC0001000번지, L1 페이지 테이블의 시작 주소는 물리 주소 0x4000, 매핑된 물리 주소는 0x00101000 번지라고 가정 하겠습니다. 우선 TTBA에서 0x4000를 읽어와 여기에 가상 주소의 상위 12 비트를 인덱스로 더합니다. 그러면 L1 페이지 테이블 엔트리의 주소는 0x4C00가 됩니다.

```
0x4000(TTBA) + 0xC00(L1 Page Table Index) = 0x4C00(L1 Page Table Entry)
```

물리 주소 0x4C00에서 L1 페이지 테이블 엔트리를 읽어 옵니다. L1 페이지 엔트리에는 물리 메모리의 페이지 프레임 주소 0x100000가 저장되어 있습니다. 여기에 가상 주소의 하위 20비트를 더하면 물리 주소가 나오게 됩니다.

```
0x100000(Base Address) + 0x01000(Offset) = 0x101000(Physical Address)
```

1단계 페이징 루틴을 작성시에 주의해야 할 점은 L1 페이지 테이블의 시작 주소는 14비트(16KB) 단위로 정렬된 주소가 되어야 한다는 점입니다. L1 페이지 테이블의 하나의 엔트리의 크기는 32비트(4B)이고, 4096개의 엔트리를 가지고 있으니, L1 페이지 테이블은 총 16KB를 할당해서 사용해야합니다. 만약 L1 페이지 테이블 시작 주소를 0x1000로 설정한다면, MMU는 TTBA의 상위 18비트만 사용하므로 0x0 번지를 L1 페이지 테이블의 시작 주소로 인식하게 됩니다. 이러면 당연히 엉뚱한 메모리 공간에 접근하였으므로 제대로 동작 할리가 없습니다.


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F33ae6196-e22e-44bc-9396-04ffc4af2240%2FUntitled.png?table=block&id=e19eb029-2329-4c15-b603-aae62fa75a2b&cache=v2 -->

![&lt;그림 3. L1 페이지 테이블 엔트리의 종류&gt;](https://img-src.io/taehun/arm-paging-2/3.png)


**<그림 3. L1 페이지 테이블 엔트리의 종류>**

<그림 3>은 ARM Cortex-A에서 사용하는 L1 페이지 테이블 엔트리의 종류 입니다. ARM Cortex-A에는 사용하지 않는 Reserved를 포함해서 총 5개의 L1 페이지 테이블이 존재합니다. 눈치 빠른 분이라면 이미 예상 하셨겠지만, ARM은 페이지 테이블 엔트리의 하위 2비트 값에 따라 종류를 판별합니다. Section과 Supersesction은 하위 2비트가 동일하지만, 18비트가 0인지 1인지에 따라 구분합니다.

Fault는 해당 엔트리에 접근하면 MMU에서 Translation Fault가 발생합니다. 메모리를 할당하지 않고 페이지에 접근시 폴트 핸들러에서 동적으로 메모리를 할당하는 **요구 페이징(Demand Paging)**을 구현하는데 활용 할 수 있습니다. Page table은 2단계 페이징에 사용되는 L1 페이지 테이블의 엔트리 입니다. Page Table 엔트리는 2단계 페이지 테이블의 시작 주소를 담고 있습니다. 1단계 페이징에 사용되는 L1 페이지 테이블 엔트리는 Section과 Supersection 입니다. 1MB 페이지를 사용하려면 Section, 16MB 페이지를 사용하려면 Supersection을 사용합니다. 페이지 테이블 엔트리의 각 필드들이 무엇을 의미하는지 하나씩 살펴보겠습니다.

- ***Section/Supersection Base Address***:1MB/16MB 페이지 프레임의 물리 주소를 나타냅니다.

- ***SBZ***: Should Be Zero. 0

- ***NG***: Not Global. 글로벌 메모리 여부를 설정합니다. TLB 플러쉬 정책과 관련있습니다.

- **S**: Shareable. 메모리 속성에 따라 공유 가능여부를 설정합니다.

- ***APX/AP****:*Access Permission, 접근 권한을 설정하는 필드 입니다.

- ***TEX***: Type extension. 메모리 속성 설정에 사용됩니다.

- ***P***: Present. 운영체제 커널과 같은 시스템 소프트웨어에서 사용하는 필드입니다. 주로 스와핑에 사용됩니다.

- ***Domain***: 도메인을 설정합니다. 메모리는 도메인별로 접근 권한 확인 여부를 설정할 수 있습니다. *No access, Client, Manager*세가지 타입으로 설정가능하며 총 16개 도메인이 존재합니다.

- ***XN***: Execute-Never 비트. CPU는 해당 메모리의 코드가 실행 가능한지 결정합니다.

- ***C***: Cacheable. 메모리 속성 설정에 사용됩니다.

- ***B***: Bufferable. 메모리 속성 설정에 사용됩니다.

페이지 테이블 엔트리의 각 필드들에 대한 내용은 뒤에 좀 더 자세히 알아 볼 것 입니다. 지금은 페이지 테이블의 각 엔트리는 페이지 프레임의 시작 주소 혹은 L2 페이지 테이블의 시작 주소를 담고 있고, 메모리의 속성과 접근 권한을 설정 할 수 있다는 것만 알아두시기 바랍니다.

이제부터 1단계 페이징을 직접 구현해 봅시다. 우선 L1 페이지 테이블 엔트리 자료 구조를 선언 합니다. 운영체제마다 가상 주소 맵이 다르고 운영체제 특성에 맞게 설계되어 있습니다. 우선 여기서는 물리 메모리 시작 주소에서 끝까지를 가상 주소 0xC0000000부터 선형 매핑하겠습니다. 물리 메모리 크기는 1GB, 시작 주소는 타겟 시스템마다 다르지만 0번지로 가정하겠습니다.

- **[코드 1] L1 페이지 테이블 엔트리 자료 구조 선언 <paging.h>**

```rust
/* L1 Page table entry. */
typedef union {
    struct {
        u32 fixed:5;    /* {0,0,0,0,1} */
        u32 domain:4;   /* Memory protection domain info. */
        u32 p:1;        /* ECC enable. Should be zero. */
        u32 base:22;    /* L2 page table base address. */
    }__attribute__((__packed__)) pt; /* Page table */
    struct {
        u32 fixed:2;    /* {1,0}*/
        u32 b:1;        /* Buffer */
        u32 c:1;        /* Cache */
        u32 xn:1;       /* Execute never */
        u32 domain:4;   /* Domain for memory regions */
        u32 p:1;        /* Implementation Defined */
        u32 ap:2;       /* Access Permission */
        u32 tex:3;      /* Type Extension */
        u32 apx:1;      /* Access Permission 2 */
        u32 s:1;        /* Shareable */
        u32 ng:1;       /* Not Global */
        u32 sbz:2;      /* 0 */
        u32 base:12;    
    }__attribute__((__packed__)) s; /* Section */
    struct {
        u32 fixed:2;    /* {1,0} */
        u32 b:1;        /* Buffer */
        u32 c:1;        /* Cache */
        u32 xn:1;       /* Execute nerver */
        u32 domain:4;   /* Domain for memory regions */
        u32 p:1;        /* Implementation Defined */
        u32 ap:2;       /* Access Permission */
        u32 tex:3;      /* Type Extecsion */
        u32 apx:1;      /* Access Permission 2 */
        u32 s:1;        /* Shareable */
        u32 ng:1;       /* Not Global */
        u32 _1:1;       /* 1 */
        u32 sbz:5;      /* 0 */
        u32 base:8;     /* Base address */
    }__attribute__((__packed__)) ss; /* Supersection */
    u32 entry;
} l1_pte_t;
```

L1 페이지 테이블 엔트리는 크기는 모두 32비트이므로 세가지 타입의 엔트리를 공용체로 선언 하였습니다. `__attribute__((__packed__))`는 gcc 확장의 일종으로, 구조체 크기를 선언한 멤버 변수 크기와 동일하게 생성하라고 gcc 컴파일러에 일러주는 것입니다. 이 옵션을 생략하면 구조체의 크기는 멤버 변수 크기와 동일하게 생성되지 않으므로, 정확한 구조체 크기를 생성하고자 할 때는 항상 사용해야 합니다. (참고> [C 구조체 정렬 제한 및 패딩](http://studyfoss.egloos.com/5409933))

이제 L1 페이지 테이블을 구축해야 합니다. 물리 메모리 시작 주소 0 번지부터 메모리 전체를 가상 주소 0xC0000000 번지부터 선형 매핑한다고 하였으니, 페이지 테이블 엔트리를 거기에 맞게 설정 해야 합니다.

- **[코드 2] L1 페이지 테이블 엔트리 설정 <paging.c>**

```html
#include <paging.h>
#include <stdlib.h>
#define L1_PT_SIZE (4*4096)      /* 페이지 테이블 엔트리 (크기)x(갯수) */
#define PAGE_SIZE  (0x100000)    /* Section 크기(1MB) */
#define MEM_SIZE   (0x40000000)  /* 메모리 크기(1GB) */
#define VIRT_START (0xC0000000)  /* 가상 메모리 시작 주소 */
#define PHY_START  (0x0)         /* 물리 메모리 시작 주소 */
void create_l1_pt(l1_pte_t *pt, u32 vaddr, u32 paddr, u32 page_size, u32 size)
{
    int i;
    char *base = (char *)pt;
    int offset = vaddr >> 20; /* 첫번째 페이지 테이블 엔트리 오프셋 */

         /* 매핑 할 메모리 크기 만큼의 L1 페이지 테이블 엔트리들을 설정 합니다. */
    for (i=0; i<size; i+=page_size, ++offset) {
        pt[offset].s.base   = (paddr+i)>>20; /* Page Frame base address*/
        pt[offset].s.sbz    = 0x0; /* 0 */
        pt[offset].s.ng     = 0x0; /* Not Global */
        pt[offset].s.s      = 0x0; /* Shareable */
        pt[offset].s.apx    = 0x0; /* Access Permission 2 */
        pt[offset].s.tex    = 0x0; /* Type Extension */
        pt[offset].s.ap     = 0x3; /* Access Permission */
        pt[offset].s.p      = 0x0; /* Implementation Defined */
        pt[offset].s.domain = 0x0; /* Domain for memory regions */
        pt[offset].s.xn     = 0x0; /* Execute never */
        pt[offset].s.c      = 0x0; /* Cache */
        pt[offset].s.b      = 0x0; /* Buffer */
        pt[offset].s.fixed  = 0x2; /* {1,0} */
    }
}
int main(void)
{
    l1_pte_t *l1_pt;
     
    /* L1 페이지 테이블 메모리 공간을 할당합니다. */
    l1_pt = (l1_pte_t *)malloc(L1_PT_SIZE);
    bzero(l1_pt, L1_PT_SIZE);
    /* L1 페이지 테이블을 구축합니다. */
    create_l1_pt(l1_pt, 0xC0000000, 0x0, PAGE_SIZE, MEM_SIZE);
    /* MMU를 활성화하여 가상 주소 사용을 시작합니다. */
    enable_paging(l1_pt);     
    /* 이제부터 물리 주소 0번지는 가상 주소 0xC0000000번지에 선형 매핑되었습니다. */
    /* Do something... */
    return 0;
}
```

먼저 L1 페이지 테이블 메모리 공간을 할당 해야 합니다. [코드 2]에서 malloc으로 L1 페이지 테이블 크기(16KB)만큼 할당 하였습니다. 페이지 테이블 관련 루틴을 구현하는 커널이나 펌웨어에는 표준 C 라이브러리인  malloc()가 지원하지 않는 경우가 많으므로 환경에 맞는 적절한 동적 메모리 할당자를 사용해야 합니다. 리눅스 커널을 예로 들면 malloc() 대신에 kmalloc()과 get\_pages()등의 동적 메모리 할당자를 지원합니다. 다시한번 강조하지만 L1 페이지 테이블의 시작 주소는 16KB 단위로 정렬되어 있어야 한다는 점입니다. 즉, 일반적인 메모리 할당자가 아닌 정렬 기능을 지원하는 메모리 할당자를 사용해야 합니다.

[코드 2]의 create\_l1\_pt() 함수는 인자로 받은 가상 주소와 물리 주소를 매핑하도록 L1 페이지 테이블을 생성하는 함수 입니다. 할당된 L1 페이지 테이블(l1\_pt)를 인자로 넣어 가상 메모리 시작 주소의 상위 12비트에서 첫번째 L1 페이지 테이블 엔트리의 오프셋을 구합니다. 첫번째 L1 페이지 테이블 엔트리부터 시작하여 매핑 할 메모리 크기만큼 각 엔트리를 설정합니다. 현재는 가상 주소가 0xC0000000이고 , 메모리 크기가 0x40000000(1GB)이므로, 3072번째 엔트리부터 4095번째 엔트리까지 총 1024개의 엔트리를 설정하게 됩니다. 각 엔트리에는 물리 메모리 페이지 프레임 주소를 설정해야 하므로 물리 메모리 시작 주소(paddr)부터 페이지 크기(0x100000, 1MB) 만큼 증가하면서 엔트리의 base 필드를 설정합니다. 페이지 테이블 엔트리의 각 필드들이 의미하는 바는 앞으로 하나씩 자세히 알아 볼 것 입니다. 우선은 매핑하려는 가상 주소가 페이지 테이블 엔트리의 인덱스(오프셋)에 해당되고, 해당 엔트리에 매핑하려는 물리 주소를 설정한다는 점에 집중합시다. [그림 2]와 [그림 3]을 참조하면서 [코드 2]의 소스 코드를 보시면 한결 이해하기가 수월 할 것 입니다.

[코드 2]는 L1 페이지 테이블 엔트리를 l1\_pte\_t 타입에서 Section 구조체 s의 각 필드를 설정하도록 구현하였지만 다음과 같이 32비트 entry 멤버 변수에 엔트리에 설정 할 값을 한번에 설정해도 무방합니다. 가독성은 조금 떨어지지만 소스 코드 라인이 줄어들고 좀 더 최적화된 코드이므로 저는 이 방법을 애용합니다.

```
/* Base|ss|tex|ap|bc|fixed */
pt[offset].entry = (paddr+i)|(0x0<<18)|(0x0<<12)|(0x3<<10)|0x0<<2)|0x2;
```

[코드 2]의 enable\_paging() 함수가 실제로 MMU를 제어하여 페이징을 활성화하는 함수입니다. 페이징 활성화 루틴은 아키텍처 종속적인 루틴이므로 어셈블리어로 작성해야 합니다.

- **[코드 3] 페이징 활성화 <paging.S>**

```
.global enable_paging
.type   enable_paging, %function
.align  4
enable_paging:
    @ 페이징 활성화를 하기전에 TLB를 플러쉬 합니다.
    mov     r1, #0x0
    mcr     p15, 0, r1, c8, c7, 0

    @ TTBCR(Translation Table Base Control Register)을 설정합니다.
    mcr     p15, 0, r1, c2, c0, 2

         @ 도메인 접근 권한을 설정합니다.
    ldr     r1, =0xffffffff
    mcr     p15, 0, r1, c3, c0, 0

    @ TTBR(Translation Table Base Register) 0에 인자로 받은 L1 페이지 테이블의
    @ 시작 주소(TTBA)를 설정합니다.
    mcr     p15, 0, r0, c2, c0, 0
        
    @ SCTLR(System Control Register)에서 MMU를 활성화하여 가상 주소를 사용합니다.
    mrc     p15, 0, r0, c1, c0, 0
    orr     r0, r0, #0x1 
    mcr     p15, 0, r0, c1, c0, 0
    mov     pc, lr
```

[ARM의 함수 호출 규약(AAPCS)](https://docs.google.com/viewer?url=http%3A%2F%2Finfocenter.arm.com%2Fhelp%2Ftopic%2Fcom.arm.doc.ihi0042d%2FIHI0042D_aapcs.pdf)에 의하면 함수의 첫번째 인자는 r0 레지스터에 저장됩니다. 그래서 [코드 2]에서 enable\_paging() 함수를 호출할때 인자로 넣은 L1 페이지 테이블의 시작 주소(l1\_pt)가 r0 레지스터에 저장되어 있다는 점을 명심하고, r0를 제외한 다른 범용 레지스터를 사용해야 합니다. 먼저 TLB에 잘못된 값이 들어있으면 페이징이 오동작하므로 TLB를 플러쉬 해야 합니다. 그리고 도메인 접근 권한을 설정하는데, 현재는 모든 도메인을 Manager로 설정하여 접근 권한 체크를 하지 않도록 하였습니다. 도메인은 No access, Client, Manager 세 종류가 있고, 도메인을 Client로 설정하면 페이지 테이블 엔트리의 AP(Access Permission) 필드의 값을 확인하여 메모리 접근 권한 체크를 하게 됩니다. 도메인은 추후 메모리 접근 권한 설정에 대한 내용을 다룰때 좀 더 자세히 살펴보도록 하겠습니다.

TTBCR(Translation Table Base Control Register)은 LPAE 사용여부 설정과 TTBR0과 TTBR1 중에 어떤 것을 TTBA로 사용 할지를 설정합니다. TTBCR을 0으로 설정하면 TTBR0를 TTBA로 사용하고 LPAE를 사용하지 않습니다. [코드 2]에서 enable\_paging() 함수를 호출하면서 인자로 받은(r0) L1 페이지 테이블의 시작 주소를 TTBR0에 설정하여 MMU가 참조하는 L1 페이지 테이블의 시작 주소를 설정합니다. 마지막으로 SCTLR의 첫번째 비트를 1로 설정하면 MMU가 활성화되어 가상 주소를 사용하게 됩니다.

페이징을 활성화하게 되면 사용하는 심볼의 주소가 달라지므로 유의해야 합니다. 예를 들어, foo()라는 함수의 주소가 0x1000 번지라고 한다면, 가상 주소 0xC0001000 번지에 foo() 함수 코드가 들어 있습니다. 하지만, 링크 스크립트 설정에 따라 바이너리 이미지를 생성하면서 foo() 함수를 호출하면 0x1000 번지로 점프하도록 코드가 생성됩니다. 심볼이 올바른 (가상) 주소를 참조 할 수 있도록 링크 스크립트와 빌드시 바이너리 조작을 적절히 해주어야 합니다. 물리 주소를 사용하는 루틴과 가상 주소를 사용하는 루틴을 따로 바이너리를 생성해서 objcopy 하는 것도 하나의 방법이 될 수 있습니다.

## 2단계 페이징

작은 크기 페이지들인 Large Page(64KB)와 Small Page(4KB)를 사용하고자 할 때는 2단계 페이징을 합니다. 물론 크기가 작은 페이지도 하나의 페이지 테이블을 활용하는 1단계 페이징으로 할 수 있습니다만, 이것은 매우 비효율적입니다. 예를 들어, 4KB 페이지를 하나의 페이지 테이블로 페이징한다고 가정해 봅시다. 32비트 머신에서 가장 주소 공간은 4GB이므로, 총 1048576개의 엔트리가 필요합니다. 하나의 엔트리 크기는 4B이므로, 페이지 테이블의 크기는 총 4MB가 됩니다. 페이지 테이블은 프로세스마다 존재하므로 프로세스를 생성할때마다 페이지 테이블 용도로 4MB 메모리 공간을 할당하는 것은 낭비가 너무 심합니다. 이것을 2단계 페이징으로 변경하면, 16KB 크기의 1단계 페이지 테이블을 할당하고, 2단계 페이지 테이블은 가상 주소 영역에서 필요한 공간만 할당해서 사용할 수 있습니다. 이것이 다단계 페이징을 하는 이유입니다. 앞으로 2단계 페이지 테이블도 L1 페이지 테이블과 마찬가지로 **L2 페이지 테이블(Level 2 Page Table)**이라고 하겠습니다.


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F0e5bc8f8-801e-40ca-8144-bd7f59fe6e94%2FUntitled.png?table=block&id=6d05f65e-534f-44d3-881d-d1dbbe6e82f1&cache=v2 -->

![&lt;그림 4. 2단계 페이징&gt;](https://img-src.io/taehun/arm-paging-2/4.png)


**<그림 4. 2단계 페이징>**

<그림 4>는 2단계 페이징 과정을 보여줍니다. MMU는 우선 TTBA(*Translation Table Base Address*)에서 L1 페이지 테이블의 시작 주소를 얻어옵니다. L1 페이지 테이블의 시작 주소에서 가상 주소 [31..20] 비트를 오프셋으로 사용하여 접근하려는 L1 페이지 테이블 엔트리의 주소를 구합니다(*Level 1 Descriptor Address*). L1 페이지 테이블 엔트리에서는 2단계 페이지 테이블 시작 주소가 저장되어 있습니다. L2 페이지 테이블 시작 주소(*Level 2 Table Base Address*)에서 가상 주소 [19..12] 비트를 오프셋으로 사용하여**L2 페이지 테이블 엔트리(L2 Page Table Entry)**의 주소를 구합니다(*Level 2 Descriptor Address*). 메모리에서 L2 페이지 테이블 엔트리를 읽어오면, L2 페이지 테이블 엔트리에 저장된 가상 주소에 해당하는 페이지 프레임의 시작 주소(*Small Page Base Address*)를 알 수 있습니다. 마지막으로 페이지 프레임의 시작 주소에서 가상 주소 [11..0] 비트를 오프셋으로 사용하여 최종 접근하는 물리 주소(*Physical Address*)를 구하게 됩니다.

사실 2단계 페이징은 단계만 하나 늘었다뿐이지 1단계 페이징과 별반 다른점이 없습니다. *<L1 페이지 테이블 시작 주소>, <L2 페이지 테이블 시작 주소>, <페이지 프레임 시작 주소>*는 각각 *<TTBA>, <L1 페이지 테이블 엔트리>, <L2 페이지 테이블 엔트리>*에 저장되어 있고, 가상 주소를 나눠서 *오프셋(인덱스)*으로 사용한다는 점만 유념합시다.

2단계 페이징 과정도 좀 더 명확하게 이해하기 위해 예를 들어 볼까요? 아래와 같이 가정하고 2단계 페이징이 어떻게 되는지 보겠습니다.

- 가상 주소 = 0xC0010010

- 물리 주소 = 0x00010010

- L1 페이지 테이블 시작 주소 = 0x4000

- L2 페이지 테이블 시작 주소 = 0x9000

먼저 TTBA에 저장된 L1 페이지 테이블 시작 주소에서 L1 페이지 테이블 시작 주소를 얻어옵니다. L1 페이지 테이블 시작 주소에서 가상 주소의 [31..20] 비트를 오프셋으로 사용하여 L1 페이지 테이블 엔트리를 구합니다.

```
0x4000(TTBA) + 0xC00(L1 PT Index) = 0x4C00(L1 Page Table Entry)
```

L1 페이지 테이블 엔트리에는 L2 페이지 테이블의 시작 주소가 저장되어 있습니다. L2 페이지 테이블 시작 주소에서 가상 주소 [19..12] 비트를 오프셋으로 사용하여 L2 페이지 테이블 엔트리를 구합니다.

```
0x9000(L2 Page Table Base) + 0x10(L2 PT Index) = 0x9010(L2 Page Table Entry)
```

L2 페이지 테이블 엔트리에는 페이지 프레임의 주소가 저장되어 있습니다. 페이지 프레임의 주소에서 가상 주소 [11..0] 비트를 오프셋으로 사용하여 최종 물리 주소를 구할 수 있습니다.

```
0x10000(Page Frame Base) + 0x10(Page Frame Index) = 0x10010(Physical Address)
```

페이지 크기가 작아질수록, 가상 주소 공간이 늘어 날수록 페이징 단계가 늘어나게 됩니다. ARM Cortex-A를 포함하여 전통적인 ARM 아키텍처는 32비트 가상 주소 공간을 제공합니다. 페이지 크기가 16MB, 1MB일때는 1단계 페이징, 페이지 크기가 64KB, 4KB일때는 2단계 페이징을 하였습니다. 반면에 우리가 PC로 많이 사용하고 있는 x86-64 아키텍처와 ARMv8의 aarch64 아키텍처는 64비트 가상 주소를 사용하는 64비트 아키텍처입니다. 64비트 아키텍처는 늘어난 가상 주소 공간을 지원하기 위해 주로 4단계 페이징을 합니다.(물론, 64비트 아키텍처도 페이지 크기에 따라 페이징 단계가 다릅니다.) 어쨋든, 페이징 단계가 늘어나더라도 각 단계별 페이지 테이블과 페이지 프레임의 오프셋으로 가상 주소를 분할하여 사용하는 것은 모두 동일합니다.

자 그럼, L2 페이지 테이블 엔트리들이 어떻게 생겼는지 한번 살펴 보겠습니다.


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F1667555c-157e-4ba4-9b0b-10a1964e85d1%2FUntitled.png?table=block&id=74d22119-afe6-4fcb-95fa-42c487151a1b&cache=v2 -->

![&lt;그림 5. L2 페이지 테이블 엔트리의 종류&gt;](https://img-src.io/taehun/arm-paging-2/5.png)


**<그림 5. L2 페이지 테이블 엔트리의 종류>**

L2 페이지 테이블 엔트리도 L1 페이지 테이블 엔트리와 마찬가지로 하위 2비트로 페이지 테이블 엔트리의 종류를 판별합니다. *Lage page*는 64KB 페이지를 사용하는 페이지 테이블 엔트리이고, *Small page*는 4KB 페이지를 사용하는 페이지 테이블 엔트리입니다. L2 페이지 테이블 엔트리는 페이지 프레임의 시작 주소를 저장하는 필드와 메모리 속성과 접근 권한을 설정하는 필드가 있습니다. 각 필드의 의미는 L1 페이지 테이블 엔트리의 것과 동일합니다. 2단계 페이징에 사용되는 L1 페이지 테이블 엔트리(*Page table*)에는 *Section*과 *Supersection*에 있던 메모리 속성과 접근 권한을 설정하는 필드가 없고, L2 페이지 테이블 엔트리에 존재하는 것 입니다.

## **메모리 속성**

페이지 테이블 엔트리의 TEX, C, B등의 필드로 메모리 속성을 설정한다고 했는데, 메모리 속성을 도대체 어떻게 설정하는지 한번 알아보겠습니다. 우선, TEX, B, C 필드 값에 따라서 다음과 같이 메모리 속성이 설정 됩니다.


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F337cb0ef-704e-41d9-8417-9af6d2fbc51d%2FUntitled.png?table=block&id=41268dae-977a-4399-bd6b-e35af61c563c&cache=v2 -->

![&lt; 테이블 1. 페이지 테이블 엔트리 값에 따른 메모리 타입과 캐시 속성 설정 &gt;](https://img-src.io/taehun/arm-paging-2/6.png)


**< 테이블 1. 페이지 테이블 엔트리 값에 따른 메모리 타입과 캐시 속성 설정 >**

<테이블 1>의 메모리 타입은 메모리 오더링을 어떻게 하는지에 따라 달라집니다. ARM Cortex-A는 세가지 메모리 오더링 모델이 존재합니다.

- Strongly-ordered: CPU로 부터 순차적으로 메모리 접근을 보장합니다. 캐싱(C)과 버퍼링(B)를 하지 않습니다.

- Device: ARM은 MMIO을 사용하므로 해당 메모리 주소 영역이 디바이스 I/O 주소를 의미합니다.

- Normal: 데이터를 저장하는 일반적인 메모리를 의미합니다.

## 도메인

도메인은 ARM에서 메모리 영역을 구분하는 매커니즘입니다. 도메인은 L1 페이지 테이블 엔트리에서 총 16개의 도메인 ID로 설정 가능하며, 도메인 별로 접근 권한을 다르게 할 수 있습니다. 도메인 설정은 DACR(Domain Access Control Register)에서 하게 되는데, 2비트로 하나의 도메인을 설정합니다.


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F89741c8a-07bb-4a82-a522-f3cd064501dc%2FUntitled.png?table=block&id=20a734df-8b70-49ac-93cf-bb781dea118d&cache=v2 -->

![&lt;그림 6. DACR&gt;](https://img-src.io/taehun/arm-paging-2/7.png)


**<그림 6. DACR>**

다음과 같이 DACR의 값을 읽거나 설정 할 수 있습니다.

```
mrc    p15, 0, <Rt>, c3, c0, 0 ; DACR 값을 Rt에 읽어옵니다.
mcr    p15, 0, <Rt>, c3, c0, 0 ; Rt 값을 DACR에 설정합니다.
```

DACR의 각 도메인에 설정하는 2비트의 값에 따라 도메인은 다른 속성을 가집니다. DACR에 설정하는 2비트 값의 의미는 다음과 같습니다.

- 0b00: ***No access***. 해당 도메인에 접근하면 **도메인 폴트(Domain Fault)**가 발생합니다.

- 0b01: ***Client.*** 페이지 테이블 엔트리의 접근 권한을 체크합니다.

- 0b10: *Resesrved.*

- 0b11: ***Manager.*** 페이지 테이블 엔트리의 접근 권한을 체크하지 않습니다.

페이지 테이블 엔트리에는 접근 권한을 설정하는 AP 필드가 있습니다(<그림 3>, <그림 5> 참고). 이 필드가 의미를 가지려면 도메인을 Client로 설정해야 합니다. 도메인을 Manager로 설정해두면 페이지 테이블 엔트리의 AP 필드 값에 따른 접근 권한을 체크하지 않고 해당 도메인은 무조건 접근이 가능합니다. 도메인을 Client로 설정하고, 페이지 테이블 엔트리의 AP 필드를 체크하여 도메인의 접근 권한을 위배하였을 경우에는 **퍼미션 폴트(Permission Fault)**가 발생합니다.

ARM은 두단계를 거쳐서 메모리 접근 권한을 체크합니다. 먼저, 페이지 테이블 엔트리의 Domain 필드에서 도메인 ID를 가져와서 해당 도메인이 Manager 또는 Client인지 확인하고, Client이면 페이지 테이블 엔트리의 AP 필드를 확인하여 메모리 접근 권한을 체크합니다.

## **접근 권한**

페이지 테이블 엔트리에 설정된 접근 권한은 해당 메모리가 속한 도메인이 Client일 경우에만 체크합니다. 페이지 테이블 엔트리의 APX, AP 필드 값에 따라 다음과 같이 접근 권한을 설정 할 수 있습니다.


<!-- TODO: 이미지 추가 - 파일명: Untitled.png, 원본: https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fb918106f-e246-42c5-9434-dcd5ad47b321%2FUntitled.png?table=block&id=d5338d79-bea9-4d0e-9bc3-2ff0ed68f61c&cache=v2 -->

![&lt;테이블 2. 페이지 테이블 엔트리 접근 권한 &gt;](https://img-src.io/taehun/arm-paging-2/8.png)


**<테이블 2. 페이지 테이블 엔트리 접근 권한 >**

위 테이블은 페이지 테이블 엔트리의 APX/AP 필드 값에 따라 Privileged/Unprivileged의 접근 권한에 대해 나타냅니다. ARM은 총 7가지 모드(SVC/USR/SYS/ABT/IRQ/FIQ/UND)을 가지고 있는데, User 모드만 **비특권(Unprivileged) 모드**에 해당되고, 나머지 6가지 모드는 모두 **특권(Privileged) 모드**입니다. 커널은 Supervisor(SVC) 모드에서 주로 동작하며, 만약 인터럽트가 발생하면 Interrupt Request(IRQ) 모드로 진입하여 인터럽트 처리를 하고 다시 SVC 모드(혹은 USR 모드)로 되돌아가는 것이 모드 전환의 한가지 예로 들 수 있습니다. 특권 모드간, 특권 모드에서 User 모드로의 모드 전환은 CPSR 상태 레지스터 조작으로 할 수 있습니다.

커널에서 사용하는 데이터 영역은 특권 모드에서 Read/Write 할 수 있도록 설정하고, 유저 모드에서 동작하는 사용자 프로세스가 접근하지 못하도록 설정해야 합니다. 그리고, 프로그램 코드 영역으로 사용하는 메모리 공간은 수정이 되면 안되므로 Read만 가능하도록 설정해서 사용해야 합니다. 보안을 고려한 운영체제라면 사용하는 메모리 공간의 용도에 맞게 적절히 메모리 접근 권한을 설정해야 합니다.

## 참고자료

[1] Cortex-A Series Programmer’s Guide

[2] Cortex-A9 Technical Reference Manual

[3] ARM Architecture Reference Manual ARMv7-A and ARMv7-R edition