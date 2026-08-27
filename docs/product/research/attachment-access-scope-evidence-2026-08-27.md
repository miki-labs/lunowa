# Attachment Access / Preview Scope Evidence — 2026-08-27

## Status

**Dated external evidence/rationale. Noncanonical.**

This note resolves the final Issue #45 scope ambiguity between **access to source attachment evidence** and **rich native in-app preview**. It does not create Product truth by existence; canonical scope belongs to `docs/product/PRODUCT.md` and `docs/product/PRODUCT-CONTENT.md` after accepted promotion.

Evidence labels:

- **EXTERNAL EVIDENCE** — current authoritative/product documentation;
- **INFERENCE** — conclusion drawn for Lunowa from current evidence + canonical Product constraints;
- **UNKNOWN** — not established.

---

## 1. Gmail: attachment access is fundamental; preview richness is not the contractual primitive

**EXTERNAL EVIDENCE — Google, current 2026 support**

Gmail documents opening/downloading attachments as ordinary message behavior and separately maintains security restrictions that block potentially harmful file types/content. The blocked-file list is explicitly updated as threats change.

Sources:

- Gmail Help, `Open & download attachments in Gmail`: https://support.google.com/mail/answer/30719
- Gmail Help, `File types blocked in Gmail`: https://support.google.com/mail/answer/6590

**INFERENCE:** a trustworthy email-centered Product needs a way for the user to reach authorized attachment evidence, but should not promise universal native preview or bypass provider/security restrictions.

---

## 2. Outlook: preview is conditional by file type/environment and security policy

**EXTERNAL EVIDENCE — Microsoft, current 2026 support**

Outlook supports opening, saving, and previewing many attachments, but preview support varies by file type and environment. Microsoft also blocks potentially unsafe attachments and disables active content during preview in supported paths.

Sources:

- Microsoft Support, `Open, save, and edit attachments received in Outlook`: https://support.microsoft.com/en-us/outlook/mail/open-save-and-edit-attachments-received-in-outlook
- Microsoft Support, `Outlook blocked access to the following potentially unsafe attachments`: https://support.microsoft.com/en-us/outlook/outlook-blocked-access-to-the-following-potentially-unsafe-attachments

**INFERENCE:** `preview` is an implementation/convenience capability layered over the more basic job of safely reaching source evidence. File-type-specific native rendering should not be a Minimum Complete Delegation Loop requirement.

---

## 3. Superhuman: current product also separates view/download from universal preview

**EXTERNAL EVIDENCE — Superhuman, current 2026 Help Center**

Superhuman Mail lets users view/download attachments, but its own documentation states that preview behavior varies by file type, browser, and OS; some types are not supported for in-app preview and instead open/download externally.

Source:

- Superhuman Help, `Attachments`: https://help.superhuman.com/hc/en-us/articles/46005568142989-Attachments

**INFERENCE:** even a mature high-performance email client does not need universal rich preview to provide a credible attachment evidence path.

---

## 4. Lunowa scope conclusion

**INFERENCE — supported by current external evidence + Lunowa Product model**

Split the Product jobs:

1. **Authorized source attachment evidence access — V1 CORE**
   - reveal that an attachment/provider file observation exists where authorized;
   - provide a safe way to reach it through supported open/download/provider-native fallback;
   - preserve Message/Conversation/Moment context and provenance;
   - honor provider/security restrictions rather than bypassing them.

2. **Rich native in-app preview — V1 STRONG CANDIDATE**
   - PDF/image/document rendering inside Lunowa is valuable context-switch reduction;
   - it is not required to prove Attention Delegation if a safe source evidence path exists;
   - exact file-type coverage is implementation/usability evidence, not current Product truth.

3. **Reply attachment add — V1 STRONG CANDIDATE**
   - promote only where validated active communication loops require it.

4. **Full attachment-content semantic understanding — DEFERRED**
   - cost, security, extraction reliability, supported formats, and incremental Product value remain unproven.

This interpretation also resolves higher-level shorthand such as `relevant attachment preview/open`: the **CORE obligation is attachment evidence access**, which may be satisfied by open/download/provider fallback; universal or rich in-app preview is not implied.

---

## 5. Safety boundary

Lunowa must not turn `CORE attachment access` into a promise to execute/open content that the provider/platform/security policy blocks. A blocked/unsafe/unsupported attachment may remain visible as source evidence with an appropriate unavailable/security boundary. Product fallback must not weaken provider protections merely to maintain feature parity.

**UNKNOWN:** exact v1 native preview file types, sandboxing architecture, download/open behavior per platform, and attachment-size limits remain implementation/security/usability decisions.