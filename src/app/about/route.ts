import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const localAssetPath = "./ReCos - Framer Website Template for Founders_files/";
const publicAssetPath =
  "/framer-recos/ReCos%20-%20Framer%20Website%20Template%20for%20Founders_files/";

const overrides = String.raw`
<script id="recos-image-slot-overrides">
(function () {
  var images = {
    recovery: "/about/recovery-income.png",
    register: "/about/step-register.jpg",
    match: "/about/step-match.jpg",
    trade: "/about/step-trade.jpg"
  };

  function setImage(img, src) {
    if (!img) return;
    img.removeAttribute("srcset");
    img.removeAttribute("sizes");
    img.src = src;
    img.style.objectFit = "cover";
    img.style.objectPosition = "center";
  }

  function findTextElement(selector, text) {
    return Array.prototype.find.call(document.querySelectorAll(selector), function (el) {
      return (el.textContent || "").trim().indexOf(text) !== -1;
    });
  }

  function findCard(el) {
    var node = el;
    while (node && node !== document.body) {
      var rect = node.getBoundingClientRect();
      if (rect.width > 250 && rect.width < 650 && rect.height > 200 && rect.height < 700) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  }

  function addStepImage(text, src, hideExistingVisual) {
    var heading = findTextElement("h5,h6", text);
    if (!heading || heading.dataset.recosImageApplied) return;
    var card = findCard(heading);
    if (!card || card.dataset.recosImageApplied) return;

    heading.dataset.recosImageApplied = "true";
    card.dataset.recosImageApplied = "true";
    card.style.overflow = "hidden";

    var cover = document.createElement("img");
    cover.src = src;
    cover.alt = "";
    cover.className = "recos-step-cover";
    cover.loading = "lazy";

    if (hideExistingVisual && card.children[1]) {
      card.children[1].style.display = "none";
    }

    var headingWrap = heading.parentElement || heading;
    headingWrap.parentElement.insertBefore(cover, headingWrap);
  }

  function apply() {
    Array.prototype.forEach.call(
      document.querySelectorAll("img[alt=\"A mockup of ReCos's mobile app\"]"),
      function (img) {
        setImage(img, images.recovery);
      }
    );

    addStepImage("01 등록하거나 요청합니다", images.register, true);
    addStepImage("02 조건으로 좁혀 비교합니다", images.match, true);
    addStepImage("03 로그인 후 직접 연락합니다", images.trade, false);
  }

  var style = document.createElement("style");
  style.textContent = [
    ".recos-step-cover{display:block!important;width:100%!important;height:180px!important;object-fit:cover!important;object-position:center!important;border-radius:24px!important;margin:0 0 28px!important;position:relative!important;z-index:1!important;}",
    "@media(max-width:809.98px){.recos-step-cover{height:150px!important;border-radius:20px!important;margin-bottom:20px!important;}}"
  ].join("");
  document.head.appendChild(style);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
  window.addEventListener("load", apply);
})();
</script>`;

export async function GET() {
  const htmlPath = path.join(process.cwd(), "public", "framer-recos", "recos-landing.html");
  const source = await readFile(htmlPath, "utf8");
  const html = source
    .replaceAll(localAssetPath, publicAssetPath)
    .replace("</body>", `${overrides}</body>`);

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
