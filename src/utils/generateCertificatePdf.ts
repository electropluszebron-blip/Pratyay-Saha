/**
 * Generates and downloads a high-fidelity Certificate of Literary Mastery PNG/PDF matching the official royal design.
 */
import html2canvas from 'html2canvas';

export interface CertificatePdfData {
  recipientName: string;
  readerId: string;
  certificateId: string;
  issueDate: string;
  readingTime?: string;
  element?: HTMLElement | null;
}

export function formatOrdinalDate(dateInput?: Date | string | number): string {
  const date = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(date.getTime())) {
    return '2nd October, 2026';
  }
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();

  const getOrdinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  return `${day}${getOrdinalSuffix(day)} ${month}, ${year}`;
}

export async function downloadCertificatePng(data: CertificatePdfData) {
  const { recipientName, element } = data;
  const cleanName = recipientName.trim() || 'Reader';

  // If DOM element is provided, use html2canvas for pixel-perfect screenshot rendering
  if (element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 3, // 3x ultra HD resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#FCFAF5',
        logging: false
      });

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1.0));
      if (blob) {
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `Wilting_of_Words_Certificate_${cleanName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        a.href = downloadUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 2500);
        return;
      }
    } catch (err) {
      console.warn('[html2canvas PNG Export Fallback]:', err);
    }
  }

  // Fallback high-res Canvas SVG generator
  await downloadCertificatePdf(data);
}

export async function downloadCertificatePdf(data: CertificatePdfData) {
  const { recipientName, readerId, certificateId, issueDate } = data;
  const cleanName = recipientName.trim() || 'Reader';
  const authenticDate = formatOrdinalDate(issueDate);

  let base64Signature = '';
  try {
    const res = await fetch('/api/certificate/proxy-signature');
    const json = await res.json();
    if (json.success && json.base64) {
      base64Signature = json.base64;
    }
  } catch (err) {
    console.warn('[Proxy Signature Client Error]:', err);
  }

  const width = 1200;
  const height = 850;

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <!-- Ivory Background -->
      <rect width="100%" height="100%" fill="#FAF7F2"/>

      <!-- Outer Solid Gold Border -->
      <rect x="20" y="20" width="${width - 40}" height="${height - 40}" fill="none" stroke="#C5A059" stroke-width="4"/>

      <!-- Inner Dashed Gold Border -->
      <rect x="36" y="36" width="${width - 72}" height="${height - 72}" fill="none" stroke="#C5A059" stroke-width="1.5" stroke-dasharray="6,4"/>

      <!-- 4 Dark Crimson Corner Brackets -->
      <g stroke="#8B261D" stroke-width="3" fill="none">
        <path d="M 44 80 L 44 44 L 80 44"/>
        <path d="M ${width - 44} 80 L ${width - 44} 44 L ${width - 80} 44"/>
        <path d="M 44 ${height - 80} L 44 ${height - 44} L 80 ${height - 44}"/>
        <path d="M ${width - 44} ${height - 80} L ${width - 44} ${height - 44} L ${width - 80} ${height - 44}"/>
      </g>

      <!-- Top Header Text -->
      <text x="50%" y="85" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="12" font-weight="bold" fill="#8B261D" letter-spacing="3">
        OFFICIAL BENGALI HERITAGE TESTIMONIAL • TECHNODEF PRESS
      </text>

      <text x="50%" y="130" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="28" font-weight="900" fill="#1A1410" letter-spacing="5">
        WILTING OF WORDS
      </text>

      <!-- Horizontal Rule with Center Dot -->
      <line x1="420" y1="148" x2="580" y2="148" stroke="#C5A059" stroke-width="2"/>
      <circle cx="600" cy="148" r="4.5" fill="#8B261D" stroke="#C5A059" stroke-width="1.5"/>
      <line x1="620" y1="148" x2="780" y2="148" stroke="#C5A059" stroke-width="2"/>

      <!-- Bengali Quote Pill Box -->
      <rect x="240" y="172" width="720" height="42" rx="8" fill="#FAF7F2" stroke="#8B261D" stroke-width="1.5"/>
      <text x="50%" y="198" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="14.5" font-weight="bold" fill="#8B261D">
        "ঝরা পাতার মতো শব্দগুলো যদি ঝরে যায়, স্মৃতিটুকু বেঁচে থাকে অক্ষরের বাঁধনে..."
      </text>

      <!-- Master Title -->
      <text x="50%" y="275" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="38" font-weight="900" fill="#1A1410" letter-spacing="5">
        CERTIFICATE OF LITERARY MASTERY
      </text>

      <text x="50%" y="315" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="15" fill="#4A3E38">
        This distinguished testimonial is officially conferred upon
      </text>

      <!-- Recipient Box -->
      <rect x="250" y="342" width="700" height="60" fill="none" stroke="#C5A059" stroke-width="2"/>
      <text x="50%" y="384" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="30" font-weight="900" fill="#8B261D" letter-spacing="4">
        ${cleanName.toUpperCase()}
      </text>

      <!-- Reader Identity Pill -->
      <rect x="410" y="420" width="380" height="28" rx="6" fill="#FFFFFF" stroke="#C5A059" stroke-width="1.2" opacity="0.6"/>
      <text x="50%" y="439" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" fill="#8B261D" letter-spacing="1">
        READER IDENTITY: ${readerId}
      </text>

      <!-- Dedication Paragraph -->
      <text x="50%" y="495" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#3E3228">
        For exemplary dedication, focused engagement, and profound appreciation during active immersion
      </text>
      <text x="50%" y="520" text-anchor="middle" font-family="Georgia, serif" font-size="13" fill="#3E3228">
        in the 219 sepia ink manuscript pages of <tspan font-weight="bold" fill="#1A1410">“Wilting of Words”</tspan>, exploring the timeless themes of identity, memory, and silence.
      </text>

      <!-- Details Card (Verification Code & Conferred Date) -->
      <rect x="240" y="560" width="720" height="54" rx="10" fill="#F7F4EE" stroke="#E5DFD3" stroke-width="1.5"/>
      <line x1="600" y1="565" x2="600" y2="609" stroke="#E5DFD3" stroke-width="1"/>

      <text x="265" y="582" font-family="'Cinzel', Georgia, serif" font-size="10" font-weight="bold" fill="#8B261D" letter-spacing="1">
        VERIFICATION CODE
      </text>
      <text x="265" y="602" font-family="monospace" font-size="14" font-weight="bold" fill="#1A1410">
        ${certificateId}
      </text>

      <text x="625" y="582" font-family="'Cinzel', Georgia, serif" font-size="10" font-weight="bold" fill="#8B261D" letter-spacing="1">
        CONFERRED DATE
      </text>
      <text x="625" y="602" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#1A1410">
        ${authenticDate}
      </text>

      <!-- Bottom Signature & Seal -->
      <!-- Left: Signature -->
      <g transform="translate(320, 680)">
        ${base64Signature ? `
          <image href="${base64Signature}" x="-75" y="-55" width="150" height="50" preserveAspectRatio="xMidYMid meet"/>
        ` : `
          <text x="0" y="-12" text-anchor="middle" font-family="'Brush Script MT', cursive, Georgia, serif" font-size="28" fill="#8B261D">Pratyay Saha</text>
        `}
        <line x1="-90" y1="0" x2="90" y2="0" stroke="#C5A059" stroke-width="2"/>
        <text x="0" y="20" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="11" font-weight="bold" fill="#8B261D" letter-spacing="2">
          PRATYAY SAHA
        </text>
        <text x="0" y="34" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="9.5" fill="#554433">
          Author &amp; Creator
        </text>
      </g>

      <!-- Right: Seal -->
      <g transform="translate(880, 680)">
        <circle cx="0" cy="-28" r="22" fill="none" stroke="#C5A059" stroke-width="2" stroke-dasharray="3,3"/>
        <text x="0" y="-23" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="9" font-weight="bold" fill="#8B261D" letter-spacing="1">
          SEAL
        </text>
        <line x1="-90" y1="0" x2="90" y2="0" stroke="#C5A059" stroke-width="2"/>
        <text x="0" y="20" text-anchor="middle" font-family="'Cinzel', Georgia, serif" font-size="11" font-weight="bold" fill="#8B261D" letter-spacing="2">
          TECHNODEF PRESS
        </text>
        <text x="0" y="34" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="9.5" fill="#554433">
          Literary Archives Seal
        </text>
      </g>

      <!-- Bottom Watermark -->
      <text x="50%" y="${height - 24}" text-anchor="middle" font-family="Georgia, serif" font-size="9" fill="#C5A059" opacity="0.8">
        Authenticity Verified by Technodef Literary Registry • Issued to ${cleanName} • ID: ${readerId}
      </text>
    </svg>
  `;

  // Convert SVG to Canvas and Download PNG
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  const img = new Image();
  const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.drawImage(img, 0, 0, width * 2, height * 2);
    URL.revokeObjectURL(url);
    const pngUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `Wilting_of_Words_Certificate_${cleanName.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  img.src = url;
}

/**
 * Opens a print-to-PDF ready window with exact replica vector formatting.
 */
export function printCertificateToPdf(data: CertificatePdfData) {
  const { recipientName, issueDate, readerId = 'READER_GUEST', certificateId = 'WOW-85A3-CERT' } = data;
  const cleanName = recipientName.trim() || 'Distinguished Reader';
  const authenticDate = formatOrdinalDate(issueDate);

  const printWindow = window.open('', '_blank', 'width=1100,height=800');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Certificate of Literary Mastery - ${cleanName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Noto+Serif+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: landscape;
            margin: 0.3cm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 10px;
            font-family: 'Cormorant Garamond', Georgia, serif;
            background: #FAF7F2;
            color: #2D241E;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .cert-outer {
            border: 4px solid #C5A059;
            padding: 6px;
            background: #FAF7F2;
            position: relative;
          }
          .cert-inner {
            border: 1.5px dashed #C5A059;
            padding: 24px 30px;
            text-align: center;
            position: relative;
          }
          .corner {
            position: absolute;
            width: 24px;
            height: 24px;
            border-color: #8B261D;
            border-style: solid;
          }
          .tl { top: 12px; left: 12px; border-width: 2.5px 0 0 2.5px; }
          .tr { top: 12px; right: 12px; border-width: 2.5px 2.5px 0 0; }
          .bl { bottom: 12px; left: 12px; border-width: 0 0 2.5px 2.5px; }
          .br { bottom: 12px; right: 12px; border-width: 0 2.5px 2.5px 0; }

          .header-tag {
            font-family: 'Cinzel', Georgia, serif;
            font-size: 10px;
            font-weight: 700;
            color: #8B261D;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            margin-bottom: 4px;
          }
          .main-heading {
            font-family: 'Cinzel', Georgia, serif;
            font-size: 26px;
            font-weight: 900;
            color: #1A1410;
            letter-spacing: 4px;
            text-transform: uppercase;
            margin: 2px 0;
          }
          .rule-box {
            display: flex;
            align-items: center;
            justify-content: center;
            max-width: 280px;
            margin: 4px auto 8px auto;
          }
          .rule-line {
            height: 1.5px;
            background: #C5A059;
            flex: 1;
          }
          .rule-dot {
            width: 7px;
            height: 7px;
            background: #8B261D;
            border-radius: 50%;
            margin: 0 8px;
            border: 1px solid #C5A059;
          }
          .quote-box {
            border: 1.2px solid #8B261D;
            border-radius: 6px;
            padding: 5px 14px;
            max-width: 540px;
            margin: 0 auto 12px auto;
            background: #FAF7F2;
          }
          .quote-text {
            font-family: 'Noto Serif Bengali', 'Cormorant Garamond', Georgia, serif;
            font-style: italic;
            font-size: 11px;
            font-weight: 600;
            color: #8B261D;
          }
          .master-title {
            font-family: 'Cinzel', Georgia, serif;
            font-size: 26px;
            font-weight: 900;
            color: #1A1410;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin: 6px 0 2px 0;
          }
          .conferred-upon {
            font-style: italic;
            font-size: 11px;
            color: #4A3E38;
            margin-bottom: 6px;
          }
          .name-box {
            border: 2px solid #C5A059;
            padding: 6px 24px;
            display: inline-block;
            min-width: 320px;
            margin-bottom: 6px;
          }
          .name-text {
            font-family: 'Cinzel', Georgia, serif;
            font-size: 22px;
            font-weight: 900;
            color: #8B261D;
            letter-spacing: 3px;
            text-transform: uppercase;
          }
          .reader-pill {
            display: inline-block;
            border: 1px solid #C5A059;
            border-radius: 4px;
            padding: 2px 10px;
            font-family: monospace;
            font-size: 9px;
            font-weight: bold;
            color: #8B261D;
            background: #FFF;
            margin-bottom: 8px;
          }
          .dedication {
            font-size: 10.5px;
            color: #3E3228;
            max-width: 600px;
            margin: 0 auto 10px auto;
            line-height: 1.45;
          }
          .details-table {
            width: 100%;
            max-width: 480px;
            margin: 0 auto 14px auto;
            background: #F7F4EE;
            border: 1px solid #E5DFD3;
            border-radius: 6px;
            padding: 6px 12px;
            display: flex;
            justify-content: space-between;
          }
          .details-col {
            text-align: left;
            flex: 1;
          }
          .details-label {
            font-family: 'Cinzel', Georgia, serif;
            font-size: 7.5px;
            font-weight: 700;
            color: #8B261D;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .details-val {
            font-family: monospace;
            font-size: 11px;
            font-weight: bold;
            color: #1A1410;
          }
          .bottom-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 20px;
          }
          .sig-box {
            text-align: left;
          }
          .sig-img {
            height: 38px;
            max-width: 130px;
            object-fit: contain;
            mix-blend-mode: multiply;
            display: block;
          }
          .sig-line {
            width: 130px;
            height: 1.5px;
            background: #C5A059;
            margin: 2px 0;
          }
          .sig-name {
            font-family: 'Cinzel', Georgia, serif;
            font-size: 8.5px;
            font-weight: bold;
            color: #8B261D;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .sig-title {
            font-style: italic;
            font-size: 7.5px;
            color: #554433;
          }
          .seal-box {
            text-align: right;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
          }
          .seal-circle {
            width: 34px;
            height: 34px;
            border: 1.5px dashed #C5A059;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 2px;
          }
          .seal-text {
            font-family: 'Cinzel', Georgia, serif;
            font-size: 8px;
            font-weight: bold;
            color: #8B261D;
          }
          .watermark {
            font-size: 7px;
            color: #C5A059;
            margin-top: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="cert-outer">
          <div class="cert-inner">
            <div class="corner tl"></div>
            <div class="corner tr"></div>
            <div class="corner bl"></div>
            <div class="corner br"></div>

            <div class="header-tag">OFFICIAL BENGALI HERITAGE TESTIMONIAL • TECHNODEF PRESS</div>
            <div class="main-heading">WILTING OF WORDS</div>

            <div class="rule-box">
              <div class="rule-line"></div>
              <div class="rule-dot"></div>
              <div class="rule-line"></div>
            </div>

            <div class="quote-box">
              <div class="quote-text">"ঝরা পাতার মতো শব্দগুলো যদি ঝরে যায়, স্মৃতিটুকু বেঁচে থাকে অক্ষরের বাঁধনে..."</div>
            </div>

            <div class="master-title">CERTIFICATE OF LITERARY MASTERY</div>
            <div class="conferred-upon">This distinguished testimonial is officially conferred upon</div>

            <div class="name-box">
              <span class="name-text">${cleanName}</span>
            </div>
            <br>
            <div class="reader-pill">READER IDENTITY: ${readerId}</div>

            <div class="dedication">
              For exemplary dedication, focused engagement, and profound appreciation during active immersion in the 219 sepia ink manuscript pages of <strong>“Wilting of Words”</strong>, exploring the timeless themes of identity, memory, and silence.
            </div>

            <div class="details-table">
              <div class="details-col" style="border-right: 1px solid #E5DFD3; padding-right: 12px;">
                <div class="details-label">VERIFICATION CODE</div>
                <div class="details-val">${certificateId}</div>
              </div>
              <div class="details-col" style="padding-left: 12px;">
                <div class="details-label">CONFERRED DATE</div>
                <div class="details-val" style="font-family:'Cormorant Garamond', Georgia, serif;">${authenticDate}</div>
              </div>
            </div>

            <div class="bottom-row">
              <div class="sig-box">
                <img class="sig-img" src="https://lh3.googleusercontent.com/d/18nXSeulDg_yk0NM8d4R_GayxZwRBvT2F" alt="Pratyay Saha's Signature" />
                <div class="sig-line"></div>
                <div class="sig-name">PRATYAY SAHA</div>
                <div class="sig-title">Author &amp; Creator</div>
              </div>

              <div class="seal-box">
                <div class="seal-circle">
                  <span class="seal-text">SEAL</span>
                </div>
                <div class="sig-line"></div>
                <div class="sig-name">TECHNODEF PRESS</div>
                <div class="sig-title">Literary Archives Seal</div>
              </div>
            </div>

            <div class="watermark">
              Authenticity Verified by Technodef Literary Registry • Issued to ${cleanName} • ID: ${readerId}
            </div>

          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

