export default function EmbedPreview({ embed = {} }) {
  const {
    color = '#8B5CF6',
    author,
    title,
    description,
    thumbnail,
    image,
    fields = [],
    footer,
    timestamp,
  } = embed

  const hasContent = title || description || (fields && fields.length > 0) || author || footer

  if (!hasContent) {
    return (
      <div className="rounded-xl p-6 text-center"
        style={{ background: '#1e1e35', border: '1px dashed rgba(139,92,246,0.3)' }}>
        <p className="text-sm" style={{ color: '#9292A5' }}>Embed preview will appear here</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg overflow-hidden max-w-lg"
      style={{ background: '#2f3136', borderLeft: `4px solid ${color || '#8B5CF6'}` }}>
      <div className="p-4">
        {author?.name && (
          <div className="flex items-center gap-2 mb-2">
            {author.iconURL && (
              <img src={author.iconURL} className="w-5 h-5 rounded-full" alt="" />
            )}
            <span className="text-sm font-medium text-white">{author.name}</span>
          </div>
        )}
        {title && (
          <p className="font-semibold mb-1" style={{ color: '#00b0f4' }}>{title}</p>
        )}
        {description && (
          <p className="text-sm mb-3 whitespace-pre-line" style={{ color: '#dcddde' }}>{description}</p>
        )}
        {fields && fields.length > 0 && (
          <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {fields.map((f, i) => (
              <div key={i} style={{ gridColumn: f.inline ? 'auto' : '1 / -1' }}>
                {f.name && <p className="text-xs font-semibold text-white mb-0.5">{f.name}</p>}
                {f.value && <p className="text-xs" style={{ color: '#dcddde' }}>{f.value}</p>}
              </div>
            ))}
          </div>
        )}
        {thumbnail?.url && (
          <img src={thumbnail.url} className="float-right ml-4 mb-2 w-16 h-16 rounded object-cover" alt="" />
        )}
        {image?.url && (
          <img src={image.url} className="w-full rounded mt-2 max-h-64 object-cover" alt="" />
        )}
        {(footer?.text || timestamp) && (
          <div className="flex items-center gap-2 mt-3 pt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', clear: 'both' }}>
            {footer?.iconURL && (
              <img src={footer.iconURL} className="w-4 h-4 rounded-full" alt="" />
            )}
            <span className="text-xs" style={{ color: '#72767d' }}>
              {footer?.text}
              {footer?.text && timestamp && ' • '}
              {timestamp && new Date(timestamp === true ? Date.now() : timestamp).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
