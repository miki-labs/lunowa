import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {isImeKeyboardEvent, LunowaShell, shellFixtures} from '@/components/lunowa-shell';

afterEach(cleanup);

const selectFixture = (value: string) => fireEvent.change(screen.getByLabelText('表示状態'), {target: {value}});
const openSource = () => fireEvent.click(screen.getByRole('button', {name: '会話を表示'}));

describe('LunowaShell', () => {
  it('renders typed Home attention and active Managed reassurance', () => {
    render(<LunowaShell />);
    expect(screen.getByRole('heading', {name: 'ホーム'})).toBeInTheDocument();
    expect(screen.getByText('今、確認が必要なこと')).toBeInTheDocument();
    expect(screen.getByText('Lunowaが見ています', {exact: false})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '確認を表示'})).toBeInTheDocument();
  });

  it('keeps Source and Moment distinct and opens each from its explicit affordance', () => {
    render(<LunowaShell />);
    openSource();
    fireEvent.click(screen.getByRole('button', {name: /佐藤ひろ子/}));
    expect(screen.getByRole('heading', {name: '来期の見積書について'})).toBeInTheDocument();
    expect(screen.getByText(/この会話は Source の原文/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /一覧に戻る/}));
    fireEvent.click(screen.getByRole('button', {name: 'この会話の対応状況を見る'}));
    expect(screen.getByRole('heading', {name: '見積書を確認して返信する'})).toBeInTheDocument();
  });

  it('keeps monitoring posture separate from integrity and strict zero', () => {
    render(<LunowaShell />);
    selectFixture('zero');
    expect(screen.getByText('今、あなたが対応する必要はありません。')).toBeInTheDocument();
    selectFixture('not-delegated');
    expect(screen.getByText('現在、任せている監視はありません')).toBeInTheDocument();
    expect(screen.queryByText('Lunowaが見ています', {exact: false})).not.toBeInTheDocument();
    selectFixture('stopped');
    expect(screen.getByText('監視はあなたが停止しました')).toBeInTheDocument();
    expect(screen.getByText(/停止は、会話が完了したことや対応不要を意味しません/)).toBeInTheDocument();
  });

  it('wires mutation fixtures locally without fabricating Send state', () => {
    render(<LunowaShell />);
    selectFixture('mutation-pending');
    fireEvent.click(screen.getByRole('button', {name: '管理中を表示'}));
    fireEvent.click(screen.getByRole('button', {name: /来期の見積書/}));
    expect(screen.getByRole('button', {name: '監視を停止しています'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button', {name: /一覧に戻る/}));
    openSource();
    fireEvent.click(screen.getByRole('button', {name: /佐藤ひろ子/}));
    fireEvent.change(screen.getByLabelText('本文'), {target: {value: '確認しました。'}});
    expect(screen.getByRole('button', {name: '送信する'})).toBeEnabled();
    selectFixture('mutation-failed');
    fireEvent.click(screen.getByRole('button', {name: '確認を表示'}));
    fireEvent.click(screen.getByRole('button', {name: /契約更新の条件/}));
    expect(screen.getByText(/回答を保存できませんでした/)).toBeInTheDocument();
    selectFixture('mutation-confirmed');
    expect(screen.getByText(/回答を保存しました。会話の状態を確認しています/)).toBeInTheDocument();
  });

  it('keeps the Send lifecycle distinct from common mutations and preserves the draft', () => {
    render(<LunowaShell />);
    openSource();
    fireEvent.click(screen.getByRole('button', {name: /佐藤ひろ子/}));
    fireEvent.change(screen.getByLabelText('本文'), {target: {value: '確認しました。'}});
    selectFixture('send-ambiguous');
    expect(screen.getByText(/送信結果を確認しています。重複送信を避けるため/)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '送信結果を確認しています'})).toBeDisabled();
    expect(screen.getByLabelText('本文')).toHaveValue('確認しました。');
    selectFixture('send-failed');
    expect(screen.getByText(/送信できませんでした。下書きは保持されています/)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: '再試行する'})).toBeEnabled();
  });

  it('renders loading, partial, degraded, and session axes separately', () => {
    render(<LunowaShell />);
    selectFixture('loading');
    expect(screen.getByText(/対応なしとは表示しません/)).toBeInTheDocument();
    selectFixture('partial');
    expect(screen.getByText(/一部の会話のみを表示/)).toBeInTheDocument();
    selectFixture('degraded');
    expect(screen.getByText('一部の監視を確認できていません')).toBeInTheDocument();
    selectFixture('session-expired');
    expect(screen.getByTestId('session-expired')).toBeInTheDocument();
  });

  it('has executable fixture axes and suppresses global shortcuts during IME composition', () => {
    expect(shellFixtures.some((fixture) => fixture.monitoringPosture === 'not_delegated')).toBe(true);
    expect(shellFixtures.some((fixture) => fixture.monitoringPosture === 'stopped_by_user')).toBe(true);
    expect(shellFixtures.some((fixture) => fixture.mutation === 'pending')).toBe(true);
    expect(shellFixtures.some((fixture) => fixture.mutation === 'confirmed')).toBe(true);
    expect(shellFixtures.some((fixture) => fixture.send === 'provider_ambiguous')).toBe(true);
    expect(isImeKeyboardEvent({isComposing: true, keyCode: 0})).toBe(true);
    expect(isImeKeyboardEvent({isComposing: false, keyCode: 229})).toBe(true);
    render(<LunowaShell />);
    fireEvent.keyDown(document, {key: '/', isComposing: true});
    fireEvent.keyDown(document, {key: '/', keyCode: 229});
    expect(screen.getByRole('heading', {name: 'ホーム'})).toBeInTheDocument();
  });

  it('does not route slash to search from an editable target', () => {
    render(<LunowaShell />);
    openSource();
    fireEvent.click(screen.getByRole('button', {name: /佐藤ひろ子/}));
    fireEvent.keyDown(screen.getByLabelText('本文'), {key: '/'});
    expect(screen.getByRole('heading', {name: '来期の見積書について'})).toBeInTheDocument();
  });
});
