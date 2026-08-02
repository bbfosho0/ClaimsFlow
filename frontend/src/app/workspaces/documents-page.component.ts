import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocumentRecord, WorkspaceDataService } from './workspace-data.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="workspace-page documents-workspace page-enter">
      <div class="workspace-tabs"><button class="active">Documents</button><button>Communications</button><button>Activity</button><button class="upload-button">Upload evidence</button></div>
      <div class="documents-layout">
        <aside class="workspace-panel folder-rail">
          <header><strong>Folders</strong><span>128 files</span></header>
          <button class="active">All documents <b>128</b></button><button>Evidence <b>54</b></button><button>Policy <b>18</b></button><button>Correspondence <b>36</b></button><button>Reports <b>20</b></button>
          <div class="integrity-card"><span>DOCUMENT INTEGRITY</span><strong>96.4%</strong><i><b></b></i><small>All critical evidence has a verified source.</small></div>
        </aside>

        <section class="workspace-panel document-list">
          <header><div><strong>Claim documents</strong><span>CF-2026-0142 · Morgan Ellis</span></div><button>Filter ⌄</button></header>
          <button *ngFor="let document of documents" type="button" [class.active]="selectedDocument().name === document.name" (click)="selectDocument(document.name)">
            <i aria-hidden="true">▤</i><span><strong>{{ document.name }}</strong><small>{{ document.type }} · {{ document.size }}</small></span><b>{{ document.status }}</b>
          </button>
        </section>

        <section class="workspace-panel document-preview">
          <header><div><strong>{{ selectedDocument().name }}</strong><span>{{ selectedDocument().type }} · {{ selectedDocument().size }}</span></div><button aria-label="Document menu">•••</button></header>
          <div class="preview-sheet"><span>CLAIM EVIDENCE</span><strong>{{ selectedDocument().name }}</strong><i></i><i></i><i></i><i></i><p>{{ selectedDocument().summary }}</p></div>
          <div class="extraction-grid"><article><span>OCR confidence</span><strong>{{ selectedDocument().confidence }}%</strong></article><article><span>Integrity</span><strong>Verified</strong></article><article><span>Version</span><strong>v3</strong></article></div>
          <div class="entity-tags"><span>Water damage</span><span>North wing</span><span>$48,200 estimate</span><span>Policy verified</span></div>
        </section>

        <section class="workspace-panel communications-panel"><header><strong>Communication history</strong><button>New message</button></header><ol><li><i data-tone="cyan"></i><div><strong>Claimant email received</strong><span>Additional accommodation receipts attached.</span></div><time>09:42</time></li><li><i data-tone="green"></i><div><strong>Adjuster note</strong><span>Loss assessment reconciled with photo evidence.</span></div><time>Yesterday</time></li><li><i data-tone="violet"></i><div><strong>AI summary refreshed</strong><span>Three new entities and one policy conflict detected.</span></div><time>Jul 31</time></li></ol></section>
        <section class="workspace-panel ai-summary-panel"><header><strong>AI evidence summary</strong><span>Advisory</span></header><p>{{ selectedDocument().summary }}</p><div><span>Coverage match</span><strong>High confidence</strong></div><div><span>Review item</span><strong>Confirm sublimit</strong></div></section>
        <section class="workspace-panel comments-panel"><header><strong>Collaborative comments</strong><span>4 active</span></header><p><b>PS</b><span><strong>Priya Shah</strong> Confirm the accommodation sublimit before approval.</span></p><label><span class="sr-only">Add a comment</span><input placeholder="Add a comment…" /><button>Send</button></label></section>
      </div>
    </section>
  `,
  styleUrl: './workspace-pages.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsPageComponent {
  private readonly data = inject(WorkspaceDataService);
  readonly documents = this.data.documents;
  readonly selectedDocument = signal<DocumentRecord>(this.documents[0]!);

  selectDocument(name: string): void {
    const document = this.documents.find(item => item.name === name);
    if (document) this.selectedDocument.set(document);
  }
}
