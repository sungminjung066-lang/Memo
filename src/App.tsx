import { useEffect, useMemo, useState } from "react";

type Memo = {
  id: string;
  text: string;
  createdAt: number;
};

const STORAGE_KEY = "memo-app:memos";

function App() {
  const [text, setText] = useState("");

  const [memos, setMemos] = useState<Memo[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Memo[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memos));
  }, [memos]);

  const canAdd = useMemo(() => text.trim().length > 0, [text]);

  const addMemo = () => {
    const v = text.trim();
    if (!v) return;

    const newMemo: Memo = {
      id: crypto.randomUUID(),
      text: v,
      createdAt: Date.now(),
    };

    setMemos((prev) => [newMemo, ...prev]);
    setText("");
  };

  const deleteMemo = (id: string) => {
    setMemos((prev) => prev.filter((m) => m.id !== id));
    if (editingId === id) cancelEdit();
  };

  const startEdit = (memo: Memo) => {
    setEditingId(memo.id);
    setEditingText(memo.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText("");
  };

  const saveEdit = () => {
    const v = editingText.trim();
    if (!editingId) return;
    if (!v) return cancelEdit();

    setMemos((prev) =>
      prev.map((m) => (m.id === editingId ? { ...m, text: v } : m)),
    );
    cancelEdit();
  };

  const clearAll = () => {
    if (!confirm("모든 메모를 삭제할까요?")) return;
    setMemos([]);
    cancelEdit();
  };

  return (
    <section className="app">
      <div className="card">
        <div className="header">
          <div>
            <h1 className="title">📝 메모장</h1>
          </div>

          <button
            className="btn btnGhost"
            onClick={clearAll}
            disabled={memos.length === 0}
            title="전체 삭제"
          >
            전체 삭제
          </button>
        </div>

        <div className="row">
          <input
            className="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="메모 입력"
            onKeyDown={(e) => {
              if (e.key === "Enter") addMemo();
            }}
          />
          <button
            className="btn btnPrimary"
            onClick={addMemo}
            disabled={!canAdd}
          >
            추가
          </button>
        </div>

        {memos.length === 0 ? (
          <p className="empty">아직 메모가 없어요.</p>
        ) : (
          <ul className="list">
            {memos.map((memo) => {
              const isEditing = editingId === memo.id;

              return (
                <li key={memo.id} className="item">
                  {isEditing ? (
                    <div style={{ display: "grid", gap: 10 }}>
                      <textarea
                        className="textarea"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            saveEdit();
                          }
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />

                      <div className="actions">
                        <button className="btn btnPrimary" onClick={saveEdit}>
                          저장
                        </button>
                        <button className="btn" onClick={cancelEdit}>
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="itemTop">
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="itemText">{memo.text}</div>
                        <div className="meta">
                          {new Date(memo.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div className="actions">
                        <button className="btn" onClick={() => startEdit(memo)}>
                          수정
                        </button>
                        <button
                          className="btn btnDanger"
                          onClick={() => deleteMemo(memo.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="tip">
        팁: 수정 중엔 <b>Ctrl+Enter</b>로 저장, <b>Esc</b>로 취소 가능
      </p>
    </section>
  );
}

export default App;
