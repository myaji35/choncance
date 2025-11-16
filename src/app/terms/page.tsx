import { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 | VINTEE",
  description: "VINTEE 이용약관",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">이용약관</h1>

      <div className="prose prose-lg max-w-none space-y-8">
        <section>
          <p className="text-gray-600">
            <strong>시행일자:</strong> 2024년 12월 1일
          </p>
          <p className="text-gray-600 mt-2">
            본 약관은 VINTEE(이하 "회사")가 제공하는 숙박 예약 플랫폼 서비스(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제1조 (목적)</h2>
          <p>
            본 약관은 VINTEE가 제공하는 숙박 예약 플랫폼 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항 기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제2조 (정의)</h2>
          <p className="mb-4">본 약관에서 사용하는 용어의 정의는 다음과 같습니다:</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>"서비스"란 회사가 운영하는 VINTEE 플랫폼을 통해 제공되는 모든 서비스를 말합니다.</li>
            <li>"회원"이란 본 약관에 동의하고 회사와 이용계약을 체결한 자를 말합니다.</li>
            <li>"게스트"란 숙소를 예약하고 이용하는 회원을 말합니다.</li>
            <li>"호스트"란 숙소를 등록하고 게스트에게 제공하는 회원을 말합니다.</li>
            <li>"숙소"란 호스트가 플랫폼에 등록한 숙박시설을 말합니다.</li>
            <li>"예약"이란 게스트가 숙소를 이용하기 위하여 플랫폼을 통해 신청하는 행위를 말합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제3조 (약관의 게시와 개정)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>회사는 본 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
            <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
            <li>회사가 약관을 개정할 경우 적용일자 및 개정사유를 명시하여 현행약관과 함께 제1항의 방식에 따라 그 개정약관의 적용일자 7일 전부터 적용일자 전일까지 공지합니다.</li>
            <li>회원은 변경된 약관에 동의하지 않을 경우 회원 탈퇴를 요청할 수 있으며, 변경된 약관의 효력 발생일로부터 7일 이내에 거부 의사를 표시하지 아니하면 약관의 변경에 동의한 것으로 간주됩니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제4조 (회원가입)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
            <li>회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
              </ul>
            </li>
            <li>회원가입계약의 성립시기는 회사의 승낙이 회원에게 도달한 시점으로 합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제5조 (회원 탈퇴 및 자격 상실)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 회원탈퇴를 처리합니다.</li>
            <li>회원이 다음 각호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>가입 신청 시에 허위 내용을 등록한 경우</li>
                <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
                <li>서비스를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
              </ul>
            </li>
            <li>회사가 회원 자격을 제한·정지 시킨 후, 동일한 행위가 2회 이상 반복되거나 30일 이내에 그 사유가 시정되지 아니하는 경우 회사는 회원자격을 상실시킬 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제6조 (서비스의 제공 및 변경)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>회사는 다음과 같은 업무를 수행합니다:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>숙소 정보 제공 및 예약 서비스</li>
                <li>숙박 관련 상품 및 정보 제공</li>
                <li>결제 서비스</li>
                <li>고객 문의 및 불만 처리</li>
                <li>기타 회사가 정하는 업무</li>
              </ul>
            </li>
            <li>회사는 서비스의 내용을 변경할 경우 변경사유, 변경내용 및 제공일자 등을 서비스 내 공지사항을 통해 사전에 공지합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제7조 (서비스의 중단)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>회사는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
            <li>회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상하지 아니합니다. 단, 회사에 고의 또는 중대한 과실이 있는 경우에는 그러하지 아니합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제8조 (예약 및 결제)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>게스트는 회사가 제공하는 절차에 따라 다음 사항을 신청합니다:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>숙소 및 이용일자 선택</li>
                <li>성명, 연락처, 이메일 등 게스트 정보 입력</li>
                <li>약관 내용, 청약철회권이 제한되는 서비스 등에 대한 확인</li>
                <li>결제 정보 입력</li>
              </ul>
            </li>
            <li>회사는 게스트의 예약 신청에 대하여 다음 각호에 해당하면 승낙하지 않을 수 있습니다:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>신청 내용에 허위, 기재누락, 오기가 있는 경우</li>
                <li>선택한 숙소가 예약 불가능한 경우</li>
                <li>기타 예약 신청에 승낙하는 것이 회사 기술상 현저히 지장이 있다고 판단하는 경우</li>
              </ul>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제9조 (환불 및 취소)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>예약 취소 및 환불 정책은 다음과 같습니다:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>체크인 7일 전까지: 100% 환불</li>
                <li>체크인 3일 전까지: 50% 환불</li>
                <li>체크인 1일 전까지: 환불 불가</li>
              </ul>
            </li>
            <li>호스트의 사정으로 예약이 취소되는 경우 전액 환불됩니다.</li>
            <li>천재지변 등 불가항력적인 사유가 발생한 경우 회사와 협의하여 환불 정책을 조정할 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제10조 (호스트의 의무)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>호스트는 다음의 사항을 준수해야 합니다:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>정확한 숙소 정보 제공</li>
                <li>게스트에게 안전하고 쾌적한 숙박 환경 제공</li>
                <li>예약 확정 후 일방적인 취소 금지</li>
                <li>게스트의 개인정보 보호</li>
              </ul>
            </li>
            <li>호스트가 제1항을 위반할 경우 회사는 해당 호스트에 대한 서비스 제공을 중단할 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제11조 (게스트의 의무)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>게스트는 다음의 사항을 준수해야 합니다:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>정확한 예약 정보 제공</li>
                <li>숙소 이용 규칙 준수</li>
                <li>숙소 시설 관리 및 파손 시 배상</li>
                <li>타인에게 피해를 주는 행위 금지</li>
              </ul>
            </li>
            <li>게스트가 제1항을 위반할 경우 회사는 해당 게스트에 대한 서비스 제공을 중단하고, 발생한 손해에 대해 배상을 청구할 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제12조 (개인정보보호)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>회사는 회원의 개인정보를 보호하기 위하여 정보통신망법 및 개인정보 보호법 등 관계 법령에서 정하는 바를 준수합니다.</li>
            <li>회사의 개인정보 처리방침은 관련 법령 및 회사의 개인정보처리방침이 정하는 바에 따릅니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제13조 (회사의 의무)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>회사는 법령과 본 약관이 금지하거나 공서양속에 반하는 행위를 하지 않으며 약관이 정하는 바에 따라 지속적이고 안정적으로 서비스를 제공하는데 최선을 다해야 합니다.</li>
            <li>회사는 회원이 안전하게 서비스를 이용할 수 있도록 개인정보(신용정보 포함)보호를 위해 보안시스템을 갖추어야 하며 개인정보처리방침을 공시하고 준수합니다.</li>
            <li>회사는 서비스 이용과 관련하여 회원으로부터 제기된 의견이나 불만이 정당하다고 인정할 경우 이를 처리해야 합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제14조 (회원의 ID 및 비밀번호 관리에 대한 의무)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>회원의 ID와 비밀번호에 관한 관리책임은 회원에게 있으며, 이를 제3자가 이용하도록 하여서는 안 됩니다.</li>
            <li>회사는 회원의 ID가 개인정보 유출 우려가 있거나, 반사회적 또는 미풍양속에 어긋나거나 회사 및 회사의 운영자로 오인할 우려가 있는 경우, 해당 ID의 이용을 제한할 수 있습니다.</li>
            <li>회원은 ID 및 비밀번호가 도용되거나 제3자가 사용하고 있음을 인지한 경우 즉시 회사에 통지하고 회사의 안내에 따라야 합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제15조 (회원에 대한 통지)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>회사가 회원에 대한 통지를 하는 경우 회원이 회사에 제출한 전자우편 주소로 할 수 있습니다.</li>
            <li>회사는 회원 전체에 대한 통지의 경우 7일 이상 회사의 게시판에 게시함으로써 제1항의 통지에 갈음할 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제16조 (저작권의 귀속 및 이용제한)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
            <li>회원은 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제17조 (분쟁해결)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>회사는 회원이 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.</li>
            <li>회사는 회원으로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다. 다만, 신속한 처리가 곤란한 경우에는 회원에게 그 사유와 처리일정을 즉시 통보합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">제18조 (재판권 및 준거법)</h2>
          <ol className="list-decimal pl-6 space-y-2">
            <li>회사와 회원 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 회원의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다. 다만, 제소 당시 회원의 주소 또는 거소가 분명하지 않거나 외국 거주자의 경우에는 민사소송법상의 관할법원에 제기합니다.</li>
            <li>회사와 회원 간에 제기된 전자상거래 소송에는 대한민국 법을 적용합니다.</li>
          </ol>
        </section>

        <section className="border-t pt-8 mt-12">
          <p className="text-sm text-gray-600">
            본 약관은 2024년 12월 1일부터 시행됩니다.
          </p>
        </section>
      </div>
    </div>
  );
}
