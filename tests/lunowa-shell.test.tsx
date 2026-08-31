import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it} from 'vitest';
import {isImeKeyboardEvent, LunowaShell, shellFixtures} from '@/components/lunowa-shell';

afterEach(cleanup);

describe('LunowaShell', () => {
  it('renders the typed Home attention and Managed reassurance surfaces', () => {
    render(<LunowaShell />);

    expect(screen.getByRole('heading', {name: 'ホーム'})).toBeInTheDocument();
    expect(screen.getByText('今、確認が必要なこと')).toBeInTheDocument();
    expect(screen.getByText('Lunowaが見ています', {exact: false})).toBeInTheDocument();
    expect(screen.getByText('対応')).toBeInTheDocument();
    expect(screen.getAllByText('確認')).toHaveLength(2);
  });

  it('keeps Source and Moment distinct and opens each from its explicit affordance', () => {
    render(<LunowaShell />);

    fireEvent.click(screen.getByRole('button', {name: '会話'}));
    fireEvent.click(screen.getByRole('button', {name: /佐藤ひろ子/}));
    expect(screen.getByRole('heading', {name: '来期の見積書について'})).toBeInTheDocument();
    expect(screen.getByText(/この会話は Source の原文/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: /一覧に戻る/}));
    fireEvent.click(screen.getByRole('button', {name: 'この会話の対応状況を見る'}));
    expect(screen.getByRole('heading', {name: '見積書を確認して返信する'})).toBeInTheDocument();
  });

  it('keeps a mutation pending instead of inventing accepted monitoring or send truth', () => {
    render(<LunowaShell />);

    fireEvent.click(screen.getByRole('button', {name: '管理中'}));
    fireEvent.click(screen.getByRole('button', {name: /来期の見積書/}));
    fireEvent.click(screen.getByRole('button', {name: '監視を停止する'}));
    expect(screen.getByRole('button', {name: '監視を停止しています'})).toBeDisabled();
    expect(screen.getByText(/停止は、確認されるまで完了や対応不要を意味しません/)).toBeInTheDocument();
  });

  it('renders loading, partial, degraded, and session axes separately', () => {
    render(<LunowaShell />);
    const picker = screen.getByLabelText('表示状態');

    fireEvent.change(picker, {target: {value: 'loading'}});
    expect(screen.getByText(/対応なしとは表示しません/)).toBeInTheDocument();

    fireEvent.change(picker, {target: {value: 'partial'}});
    expect(screen.getByText(/一部の会話のみを表示/)).toBeInTheDocument();

    fireEvent.change(picker, {target: {value: 'degraded'}});
    expect(screen.getByText('一部の監視を確認できていません')).toBeInTheDocument();

    fireEvent.change(picker, {target: {value: 'session-expired'}});
    expect(screen.getByTestId('session-expired')).toBeInTheDocument();
  });

  it('only renders the strict all-clear fixture with trusted readiness and no attention or Review', () => {
    render(<LunowaShell />);
    fireEvent.change(screen.getByLabelText('表示状態'), {target: {value: 'zero'}});

    expect(screen.getByText('今、あなたが対応する必要はありません。')).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /確認確認が1件/})).not.toBeInTheDocument();
  });

  it('has a complete fixture set and suppresses global shortcut behavior during IME composition', () => {
    expect(shellFixtures.map((fixture) => fixture.id)).toEqual([
      'normal', 'zero', 'loading', 'partial', 'degraded', 'session-expired'
    ]);
    expect(isImeKeyboardEvent({isComposing: true, keyCode: 0})).toBe(true);
    expect(isImeKeyboardEvent({isComposing: false, keyCode: 229})).toBe(true);
    expect(isImeKeyboardEvent({isComposing: false, keyCode: 13})).toBe(false);

    render(<LunowaShell />);
    fireEvent.keyDown(document, {key: '/', isComposing: true});
    expect(screen.getByRole('heading', {name: 'ホーム'})).toBeInTheDocument();
    fireEvent.keyDown(document, {key: '/', keyCode: 229});
    expect(screen.getByRole('heading', {name: 'ホーム'})).toBeInTheDocument();
  });

  it('does not route slash to search from an editable target', () => {
    render(<LunowaShell />);
    fireEvent.click(screen.getByRole('button', {name: '会話'}));
    fireEvent.click(screen.getByRole('button', {name: /佐藤ひろ子/}));
    const body = screen.getByLabelText('本文');

    fireEvent.keyDown(body, {key: '/'});
    expect(screen.getByRole('heading', {name: '来期の見積書について'})).toBeInTheDocument();
  });
});
