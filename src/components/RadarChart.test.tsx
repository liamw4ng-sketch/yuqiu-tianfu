import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RadarChart, radarPoint } from './RadarChart'

describe('radarPoint', () => {
  it('el eje 0 apunta hacia arriba', () => {
    const [x, y] = radarPoint(0, 6, 1, 100, 170, 170)
    expect(x).toBeCloseTo(170, 6)
    expect(y).toBeCloseTo(70, 6)
  })
  it('ratio 0 cae en el centro', () => {
    expect(radarPoint(3, 6, 0, 100, 170, 170)).toEqual([170, 170])
  })
})

describe('RadarChart', () => {
  const axes = ['爆发力', '耐力', '反应速度', '网前手感', '移动速度', '后场高远'].map((label, i) => ({ label, value: i + 2, secondary: 5 }))
  it('dibuja las 6 etiquetas y las dos capas', () => {
    render(<RadarChart axes={axes} primaryLabel="当前" secondaryLabel="体型倾向" />)
    for (const a of axes) expect(screen.getByText(a.label)).toBeInTheDocument()
    expect(screen.getByTestId('radar-primary').getAttribute('points')!.split(' ')).toHaveLength(6)
    expect(screen.getByTestId('radar-secondary')).toBeInTheDocument()
    expect(screen.getByText('体型倾向')).toBeInTheDocument()
  })
  it('sin valores secundarios no dibuja la segunda capa', () => {
    render(<RadarChart axes={axes.map(({ label, value }) => ({ label, value }))} />)
    expect(screen.queryByTestId('radar-secondary')).toBeNull()
  })
})
