# 권리와 배포 범위

저장소 소유자의 공개 source 준비 지시에 따라 first-party 코드에 MIT LICENSE를 추가했습니다. 외부 package·UI primitive·font의 원래 license를 대체하지 않습니다.

실제 runtime package의 제공 license 원문과 Radix 공통 MIT·shadcn/ui MIT 원문을 THIRD_PARTY_NOTICES.md에 포함했습니다. DOMPurify는 제공되는 Apache-2.0 또는 MPL-2.0 중 Apache-2.0의 조건으로 사용하며 두 원문을 그대로 보존합니다. 원래 ATTRIBUTIONS.md의 Unsplash 문구는 보존용이며 이 edition에는 사진이 없습니다.

## PDF font

PDF의 embedded NanumGothic Regular/Bold는 수정하지 않은 v3.020 font입니다. Font 내부 copyright는 “Copyright © 2011 NHN Corporation. All rights reserved. Font designed by Sandoll Communications Inc.”입니다. 배포 OFL 원문은 Copyright (c) 2010, NHN Corporation과 Nanum 계열 Reserved Font Name을 명시하며 원문 전체를 함께 보존합니다.

Google Fonts의 배포 TTF와 embedded base64를 decode한 bytes가 각각 일치함을 확인했습니다.

- [Google Fonts NanumGothic](https://github.com/google/fonts/tree/main/ofl/nanumgothic)
- [OFL 원문](https://github.com/google/fonts/blob/main/ofl/nanumgothic/OFL.txt), 저장소 내 `fonts/OFL-NanumGothic.txt`
- Regular SHA-256: `76f45ef4a6bcff344c837c95a7dcc26e017e38b5846d5ae0cdcb5b86be2e2d31`
- Bold SHA-256: `f96298f9fb18e364d2370f4c3ce948ac67a2b61af992d7234bc15c42b033c674`

SIL Open Font License 1.1에 따라 font와 copyright·license를 함께 배포하며 별도로 font만 판매하지 않습니다. PDF embedding을 포함하는 문서 자체에 font license를 강제하지 않습니다. 화면은 외부 font 요청 없이 사용자 환경의 한국어 font fallback을 사용합니다.

원본 운영 문서·환경 파일·비공개 주소·미사용 font 경로·기존 배포 설정은 공개 edition에 포함하지 않습니다. 테스트 숫자는 tests/와 별도 QA 증거에 한정하며 실제 금융기관·고객 정보나 실적으로 제시하지 않습니다.
