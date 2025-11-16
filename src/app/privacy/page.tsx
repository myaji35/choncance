import { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | VINTEE",
  description: "VINTEE 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">개인정보처리방침</h1>

      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <p className="text-gray-600">
            <strong>시행일자:</strong> 2024년 12월 1일
          </p>
          <p className="text-gray-600 mt-2">
            VINTEE(이하 "회사")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">1. 개인정보의 수집 및 이용 목적</h2>
          <p className="mb-4">회사는 다음의 목적을 위하여 개인정보를 수집 및 이용합니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>회원 가입 및 관리</li>
            <li>숙소 예약 및 결제 서비스 제공</li>
            <li>고객 문의 및 불만 처리</li>
            <li>서비스 개선 및 신규 서비스 개발</li>
            <li>마케팅 및 광고 활용 (동의한 경우에 한함)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. 수집하는 개인정보의 항목</h2>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.1 필수 수집 항목</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>회원가입 시: 이메일, 이름, 비밀번호</li>
            <li>예약 시: 이름, 전화번호, 이메일</li>
            <li>결제 시: 결제 정보 (카드 정보는 PG사에서 처리)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.2 선택 수집 항목</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>프로필 사진</li>
            <li>생년월일</li>
            <li>마케팅 수신 동의</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">2.3 자동 수집 항목</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>접속 IP 주소</li>
            <li>쿠키</li>
            <li>접속 로그</li>
            <li>기기 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. 개인정보의 보유 및 이용기간</h2>
          <p className="mb-4">회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.1 회원 정보</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>회원 탈퇴 시까지 (단, 관련 법령에 따라 일부 정보 보관)</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">3.2 예약 및 결제 정보</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>전자상거래법에 따라 5년간 보관</li>
            <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. 개인정보의 제3자 제공</h2>
          <p className="mb-4">회사는 원칙적으로 이용자의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서 처리하며, 다음의 경우에만 제3자에게 제공합니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">4.1 제공 업체</h3>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <ul className="space-y-4">
              <li>
                <strong>숙소 호스트</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>제공 항목: 예약자 이름, 전화번호, 이메일, 예약 정보</li>
                  <li>제공 목적: 숙박 서비스 제공</li>
                  <li>보유 기간: 숙박 완료 후 3년</li>
                </ul>
              </li>
              <li>
                <strong>토스페이먼츠 (결제대행사)</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>제공 항목: 결제 정보</li>
                  <li>제공 목적: 결제 처리</li>
                  <li>보유 기간: 5년</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. 개인정보 처리의 위탁</h2>
          <p className="mb-4">회사는 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다:</p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <ul className="space-y-4">
              <li>
                <strong>AWS (Amazon Web Services)</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>위탁 업무: 클라우드 서버 호스팅</li>
                </ul>
              </li>
              <li>
                <strong>SendGrid</strong>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>위탁 업무: 이메일 발송</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">6. 정보주체의 권리·의무 및 그 행사방법</h2>
          <p className="mb-4">이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>개인정보 열람 요구</li>
            <li>개인정보 정정 요구</li>
            <li>개인정보 삭제 요구</li>
            <li>개인정보 처리정지 요구</li>
          </ul>
          <p className="mt-4">위 권리 행사는 서비스 내 설정 메뉴 또는 고객센터(support@vintee.kr)를 통해 가능합니다.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">7. 개인정보의 파기</h2>
          <p className="mb-4">회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</p>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.1 파기 절차</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류함) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 파기됩니다.</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">7.2 파기 방법</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>전자적 파일 형태: 복원이 불가능한 방법으로 영구 삭제</li>
            <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">8. 개인정보 보호책임자</h2>
          <p className="mb-4">회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>

          <div className="bg-gray-50 p-6 rounded-lg">
            <p><strong>개인정보 보호책임자</strong></p>
            <ul className="mt-4 space-y-2">
              <li>이름: VINTEE 개인정보보호팀</li>
              <li>이메일: privacy@vintee.kr</li>
              <li>전화: 1544-XXXX</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">9. 개인정보의 안전성 확보 조치</h2>
          <p className="mb-4">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육</li>
            <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
            <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">10. 개인정보 자동 수집 장치의 설치·운영 및 거부</h2>
          <p className="mb-4">회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>쿠키의 설치·운영 및 거부: 웹브라우저 상단의 도구 &gt; 인터넷 옵션 &gt; 개인정보 메뉴의 옵션 설정을 통해 쿠키 저장을 거부 할 수 있습니다.</li>
            <li>쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">11. 개인정보 처리방침 변경</h2>
          <p className="mb-4">본 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">12. 개인정보 침해 관련 상담 및 신고</h2>
          <p className="mb-4">개인정보침해에 대한 신고·상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
            <li>대검찰청 사이버범죄수사단: 02-3480-3573 (cybercid.spo.go.kr)</li>
            <li>경찰청 사이버안전국: (국번없이) 182 (cyberbureau.police.go.kr)</li>
          </ul>
        </section>

        <section className="border-t pt-8 mt-12">
          <p className="text-sm text-gray-600">
            본 방침은 2024년 12월 1일부터 시행됩니다.
          </p>
        </section>
      </div>
    </div>
  );
}
