+++
title = "AWS 자격증 시험 후기 - SAA-C03, MLS-C01"
date = 2023-11-26
draft = false

[taxonomies]
tags = ['AWS', '자격증']

[extra]
author = "김태훈"
toc = true
+++

저번달에 AWS에서 자격증 챌린지 (응시료 반값 할인) 광고 메일을 받았습니다. 응시료가 반값? 최근 바쁜 일도 없겠다 응시료도 반 값 할인 하는데, 해봐야죠. 그래서 AWS 자격증을 응시해서 취득했습니다.

사실 아직 배움의 단계에 있는 신입 엔지니어가 아니면, AWS 자격증 보유 유무와 AWS 인프라 실무 능력은 비례하지 않습니다. 어차피 요구사항에 맞는 인프라를 구성하려면, 그때그때 필요한 정보를 GPT와 구글에서 찾아가면서 하거든요. MSP 업체와 AWS 솔루션 아키텍트분들도 도움을 주시구요. 물론, 자격증이 전혀 도움이 되지 않는건 아닙니다. 자격증 시험 준비하면서 생소한 AWS 서비스들을 알게되어 좋았습니다. 취업이나 이직을 준비하시는 분들에게는 이력서에 작성 할 내용이 한 줄 추가되는 장점도 있습니다… 😅

## AWS 자격증 소개

AWS 자격증 시험은 Amazon Web Services(AWS)가 제공하는 클라우드 컴퓨팅 분야의 전문성을 인증하는 시험입니다. 이 자격증은 IT 전문가들이 AWS 플랫폼에서의 기술적 능력과 전문 지식을 입증하는 데 도움을 줍니다. AWS 자격증은 다양한 수준과 전문 분야로 나뉘어 있으며, 이는 개인의 경력 목표나 역할에 따라 선택할 수 있습니다.

## **주요 AWS 자격증 카테고리**

1. **AWS Certified Cloud Practitioner**: 이 입문 수준의 시험은 AWS 클라우드의 기본 개념, 기본 서비스, 보안, 아키텍처, 가격 및 지원에 대한 기본 지식을 평가합니다.

2. **AWS Certified Solutions Architect**: 이 카테고리에는 'Associate'와 'Professional' 두 가지 수준이 있습니다. 솔루션 아키텍트 자격증은 AWS에서 고가용성, 비용 효율적이고 안전한 애플리케이션 및 시스템을 설계하는 데 중점을 둡니다.

3. **AWS Certified Developer**: 이 'Associate' 수준의 시험은 AWS 플랫폼에서 애플리케이션을 개발하고 유지하는 데 필요한 기술 지식을 평가합니다.

4. **AWS Certified SysOps Administrator**: 'Associate' 및 'Professional' 수준으로 제공되며, 시스템 운영 관리자가 AWS 환경에서 시스템을 운영하고 관리하는 능력을 평가합니다.

5. **AWS Certified DevOps Engineer**: 'Professional' 수준의 이 자격증은 자동화 프로세스, CI/CD 파이프라인 구축, 모니터링 및 로깅 시스템을 구현하는 능력을 평가합니다.

6. **AWS Certified Security**: 이 자격증은 클라우드 보안의 모범 사례, AWS 보안 서비스, 보안 컨트롤의 구현 및 관리에 대한 전문 지식을 평가합니다.

7. **AWS Certified Data Analytics**: 이 자격증은 데이터 분석과 관련된 서비스와 툴의 활용, 대규모 데이터의 처리 및 분석에 대한 지식을 평가합니다.

8. **AWS Certified Machine Learning**: 기계 학습 모델과 관련된 AWS 서비스의 선택, 구현, 배포 및 유지 관리에 대한 전문 지식을 평가합니다.

## **시험 준비 및 응시**

- **준비 과정**: AWS는 온라인 및 강의실 교육, 디지털 트레이닝, 자체 학습 자료 등 다양한 학습 자료를 제공합니다.

- **시험 형식**: 대부분의 시험은 객관식 및 다답안 문제로 구성되어 있습니다.

- **응시 방법**: Pearson VUE 또는 PSI를 통해 온라인으로 시험을 예약하고 응시할 수 있습니다. 오프라인 시험 센터에서 응시할 수도 있습니다.

- **유효 기간**: 자격증은 취득 후 3년간 유효합니다.

라고 ChatGPT가 알려주네요…제가 취득한 자격증은 *AWS Certified Solutions Architect (SAA-C03), AWS Certified Machine Learning (MLS-C01)* 입니다.

> *[AWS Certification 시험 일정 예약](https://aws.amazon.com/ko/certification/certification-prep/testing/)* 내용을 참고하세요.

시험 장소는 온라인은 추천하지 않습니다. 만약, 온라인으로 신청 하셨다면, 시험 프로그램 실행시 **MacOS 차단 모드**가 비활성화 되어 있는지 반드시 확인 하세요. 저는 SAA-C03 시험때 온라인 신청해서 MacOS 차단 모드 문제로 꽤나 고생 했습니다.

## 시험 준비 방법

저는 이미 다년간 실무에서 AWS 인프라를 다루어본 경험이 있습니다. 그래서 SAA-C03, MLS-C01 두 시험 모두 별도의 강의를 듣거나 하지 않았습니다. 그냥 자격증 시험 덤프를 2번 풀어보고 시험에 응시 했습니다. 아래와 같은 과정으로 자격증 시험을 준비 했습니다:

1. *[Examtopics](https://www.examtopics.com/)* *덤프 싸이트에서 자격증 시험 문제 페이지에 접속*

1. [SAA-C03](https://www.examtopics.com/exams/amazon/aws-certified-solutions-architect-associate-saa-c03/view/)
2. [MLS-C01](https://www.examtopics.com/exams/amazon/aws-certified-machine-learning-specialty/view/)

2. *시험 문제를 노션에 정리*

→ 문제 정답은 거의 대부분 ***Community vote***가 가장 높은 보기입니다. **Correct Answer:** 는 그냥 무시하세요.

3. ***생소한 서비스가 나오거나 이해가 안되는 문제는 검색해서 찾아보기***

4. *2회차때는 빠르게 풀어보고 정답은 그냥 외우기*

순수 자격증 취득만 목적이면 3번 과정은 필요하지 않을 수도 있습니다. 그래도 뭔가 배우는 점이 있어야겠다는 생각에 3번 과정에 가장 많은 시간을 할애 했습니다.

준비 기간은 SAA-C03는 2주, MLS-C01는 1주 총 3주가 걸렸습니다. 준비 시간은 퇴근후 매일 약 2시간, 시험 전날에는 거의 밤을 새다시피 약 5시간을 준비 했습니다. 계산해보면 SAA-C03는 30~35 시간, MLS-C01는 15~18시간을 준비 했네요.

## 시험 결과 및 후기

[AWS Certified Solutions Architect – Associate was issued by Amazon Web Services Training and Certification to Taehun Kim.

Earners of this certification have a comprehensive understanding of AWS services and technologies. They demonstrated the ability to build secure and robust solutions using architectural design principles based on customer requirements. Badge owners are able to strategically design well-architected distributed systems that are scalable, resilient, efficient, and fault-tolerant.

https://www.credly.com/badges/3383825a-ac0c-4b51-9673-2bad79d22017/public\_url


<!-- TODO: 이미지 추가 - 파일명: linkedin_thumb_image.png, 원본: https://www.notion.so/image/https%3A%2F%2Fimages.credly.com%2Fimages%2F0e284c3f-5164-4b21-8660-0d84737941bc%2Flinkedin_thumb_image.png?table=block&id=eec9ceff-a1ff-49ae-b2e9-a4075de27879&cache=v2 -->

![AWS Certified Solutions Architect – Associate was issued by Amazon Web Services Training and Certification to Taehun Kim.](https://img-src.io/taehun/aws-certification/1.png)
](https://www.credly.com/badges/3383825a-ac0c-4b51-9673-2bad79d22017/public_url)

[AWS Certified Machine Learning – Specialty was issued by Amazon Web Services Training and Certification to Taehun Kim.

Earners of this certification have an in-depth understanding of AWS machine learning (ML) services. They demonstrated ability to build, train, tune, and deploy ML models using the AWS Cloud. Badge owners can derive insight from AWS ML services using either pretrained models or custom models built from open-source frameworks.

https://www.credly.com/badges/ac751e2a-634f-4015-92b9-bc9ca50fa6e4/public\_url


<!-- TODO: 이미지 추가 - 파일명: linkedin_thumb_image.png, 원본: https://www.notion.so/image/https%3A%2F%2Fimages.credly.com%2Fimages%2F778bde6c-ad1c-4312-ac33-2fa40d50a147%2Flinkedin_thumb_image.png?table=block&id=f0309361-75b3-4186-9c80-9b6032b10dd6&cache=v2 -->

![AWS Certified Machine Learning – Specialty was issued by Amazon Web Services Training and Certification to Taehun Kim.](https://img-src.io/taehun/aws-certification/2.png)
](https://www.credly.com/badges/ac751e2a-634f-4015-92b9-bc9ca50fa6e4/public_url)

결과는 두 시험 모두 800점대 중반 점수로 합격 했습니다. (750점이 합격 커트라인 입니다) 관련 강의를 들으면서, 덤프를 3번이상 풀어보면 900점은 여유롭게 넘길 수 있을것 같네요. 다른 AWS 자격증이나 직무 관련 자격증을 취득할 것인가? 는 고민 중 입니다. *‘그 시간에 차라리 사이드 프로젝트나 다른걸 하는게 더 가치 있지 않을까?’, ‘그래도, AWS Certified DevOps Engineer - Professional 는 있으면 좋을것 같은데…’, ‘요령도 생겼는데 GCP 자격증도 따볼까?’* 라는 여러가지 생각이 드네요.