# EWO SWF Knowledge Repository

本リポジトリは  
SWF生成を再現可能な標準プロセスとして固定するための正本である。

---

# 1. 目的

- 属人性を排除する
- PDCAを強制構造にする
- 判断を必ず記録する
- 再発を防止する

---

# 2. 参照順（必須）

作業時は必ずこの順番で参照する：


spec → decisions → examples → templates → checklists


---

# 3. ディレクトリ構造


swf/
spec/ ← 原則・構造定義
decisions/ ← ADR（判断履歴）
templates/ ← 強制フォーマット
checklists/ ← 作業前確認
manifest/ ← 現在の基準（baseline）


---

# 4. Baseline（現在の正本）

現在の再現基準は：


swf/manifest/baseline.md


Baseline更新は必ずPRで行う。

---

# 5. ブランチ戦略

- mainは常に安定状態
- feature/* で作業
- fix/* で修正
- docs/* で文書更新
- PR必須

詳細：
`swf/decisions/ADR-0001-branch-strategy.md`

---

# 6. 作業開始方法

1. `swf/checklists/work-start-checklist.md` を確認
2. featureブランチ作成
3. PRテンプレを使ってPR作成
4. 判断があればADR追加

---

# 7. 禁止事項

- specなき実装
- PRなき改善
- 判断の未記録
- main直接変更

---

このリポジトリは「知識の正本」である。
