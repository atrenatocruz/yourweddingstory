export type TallyStatus = 'idle' | 'saving' | 'error'

interface TallyDotProps {
  status: TallyStatus
  labels?: Partial<Record<TallyStatus, string>>
  showLabel?: boolean
}

const defaultLabels: Record<TallyStatus, string> = {
  idle: 'Guardado',
  saving: 'A gravar…',
  error: 'Erro ao gravar',
}

export function TallyDot({ status, labels, showLabel = true }: TallyDotProps) {
  const word = { ...defaultLabels, ...labels }[status]

  return (
    <span className="admin-tally">
      <span
        className={`admin-tally-dot${status === 'saving' ? ' is-saving' : ''}${status === 'error' ? ' is-error' : ''}`}
        aria-hidden="true"
      />
      {showLabel && <span className="admin-tally-word">{word}</span>}
    </span>
  )
}
