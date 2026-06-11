export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-line pb-5">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Terms</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">이용약관 및 면책 고지</h1>
      </div>
      <section className="border border-line bg-white p-5 text-sm leading-7 text-slate-700">
        <h2 className="text-xl font-extrabold text-slate-900">서비스 성격</h2>
        <p className="mt-3">
          ReCos는 화장품 원료 판매자와 구매자가 직접 연락할 수 있도록 등록 정보와 검색 기능을
          제공하는 매칭형 서비스입니다. ReCos는 거래 당사자가 아니며 결제, 정산, 배송, 품질 보증을
          대행하지 않습니다.
        </p>
        <h2 className="mt-6 text-xl font-extrabold text-slate-900">거래 책임</h2>
        <p className="mt-3">
          원료의 품질, 유효기한, 보관 상태, 사용 가능 여부, 법적 적합성, 표시·광고 관련 책임은
          판매자와 구매자가 직접 확인해야 합니다. MSDS, COA, SDS 등 서류는 판단 보조 자료이며
          최종 검증 책임은 거래 당사자에게 있습니다.
        </p>
        <h2 className="mt-6 text-xl font-extrabold text-slate-900">개인정보 및 연락처</h2>
        <p className="mt-3">
          연락처는 로그인 사용자에게만 공개됩니다. 사용자는 열람한 연락처를 해당 원료 거래 문의
          목적 외로 사용하거나 제3자에게 제공해서는 안 됩니다.
        </p>
        <h2 className="mt-6 text-xl font-extrabold text-slate-900">분쟁</h2>
        <p className="mt-3">
          거래 과정에서 발생하는 대금, 품질, 배송, 법적 분쟁은 거래 당사자 간 해결해야 하며,
          ReCos는 고의 또는 중대한 과실이 없는 한 이에 대한 책임을 부담하지 않습니다.
        </p>
      </section>
    </main>
  );
}
