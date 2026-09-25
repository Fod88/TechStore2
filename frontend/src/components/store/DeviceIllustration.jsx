// Shown in the hero when the catalog has no product imagery yet.
export default function DeviceIllustration() {
  return (
    <svg className="device-art" viewBox="0 0 520 400" role="img" aria-label="Illustration of a laptop, phone and speaker">
      <g className="art-line">
        <rect x="70" y="70" width="290" height="190" rx="14" className="art-fill-white" />
        <rect x="86" y="86" width="258" height="158" rx="6" className="art-fill-tint" />
        <path d="M40 276h350a0 0 0 0 1 0 0v6a14 14 0 0 1-14 14H54a14 14 0 0 1-14-14z" className="art-fill-white" />
        <path d="M190 276h50" />
        <rect x="360" y="130" width="118" height="220" rx="22" className="art-fill-white" />
        <rect x="372" y="150" width="94" height="170" rx="8" className="art-fill-tint" />
        <path d="M400 138h38" />
        <circle cx="130" cy="335" r="38" className="art-fill-white" />
        <circle cx="130" cy="335" r="22" />
        <circle cx="130" cy="335" r="7" className="art-fill-accent" />
      </g>
      <g className="art-ui">
        <path d="M104 112h84M104 132h140M104 152h110" />
        <rect x="104" y="176" width="70" height="42" rx="6" />
        <rect x="186" y="176" width="70" height="42" rx="6" />
        <path d="M388 176h62M388 196h44M388 216h56" />
      </g>
    </svg>
  );
}
