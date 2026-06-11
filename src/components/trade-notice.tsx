export function TradeNotice() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-sub">
      <h2 className="font-semibold text-ink">거래 전 꼭 확인하세요</h2>
      <p className="mt-2 leading-6">
        ReCos는 회원 간 거래를 연결하는 중개형 정보 플랫폼입니다. 거래 분쟁·손해·계약
        불이행·제품 품질 및 적법성은 거래 당사자가 직접 확인·책임지며, 플랫폼은 이에 대해
        책임지지 않습니다. 등록 정보·품질 문서·거래 조건·법적 적합성을 반드시 직접
        검토하세요.
      </p>
    </div>
  );
}
