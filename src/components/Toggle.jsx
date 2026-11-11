export default function Toggle({ checked, onChange, disabled = false, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none"
      style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div className="relative flex-shrink-0" onClick={() => !disabled && onChange(!checked)}>
        <div className="w-11 h-6 rounded-full transition-colors duration-200"
          style={{ background: checked ? '#8B5CF6' : '#1e1e35', border: `2px solid ${checked ? '#8B5CF6' : '#3a3a5c'}` }}>
          <div className="w-4 h-4 bg-white rounded-full absolute transition-transform duration-200 shadow-sm"
            style={{ top: '2px', left: checked ? '22px' : '2px' }} />
        </div>
      </div>
      {label && <span className="text-sm text-white font-medium">{label}</span>}
    </label>
  )
}
