import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {BootstrapProof} from '@/components/bootstrap-proof';

describe('BootstrapProof', () => {
  it('renders the localized bootstrap contract', () => {
    render(
      <BootstrapProof
        eyebrow="Phase 0"
        title="Lunowaの基盤が動作しています"
        description="検証可能な基盤です。"
        status="検証済み"
      />
    );

    expect(
      screen.getByRole('heading', {name: 'Lunowaの基盤が動作しています'})
    ).toBeInTheDocument();
    expect(screen.getByText('検証済み')).toBeInTheDocument();
  });
});
