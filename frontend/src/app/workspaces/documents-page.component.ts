import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DocumentRecord, WorkspaceDataService } from './workspace-data.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="workspace-page documents-workspace page-enter">
      <div class="workspace-tabs documents-toolbar" aria-label="Document workspace views">
        <button class="active" type="button"><i data-tone="cyan"></i>All Items</button>
        <button type="button"><i data-tone="blue"></i>Documents</button>
        <button type="button"><i data-tone="violet"></i>Messages</button>
        <button type="button"><i data-tone="green"></i>Approvals</button>
        <button type="button" class="bulk-control">● Bulk Actions</button>
        <button type="button" class="upload-button"><i data-tone="green"></i>Upload Documents</button>
      </div>

      <div class="documents-layout figma-documents-layout">
        <aside class="workspace-panel folder-rail document-folders">
          <header><strong>Document Folders</strong></header>
          <button *ngFor="let folder of folders; let index = index" type="button" [class.active]="index === 0"><i aria-hidden="true"></i><span>{{ folder.label }}</span><b>{{ folder.count }}</b></button>
          <div class="storage-block">
            <span>STORAGE</span>
            <p>2.4 GB of 10 GB used</p>
            <i><b></b></i>
          </div>
        </aside>

        <section class="workspace-panel document-list figma-document-list">
          <header><strong>All Documents (128)</strong><button type="button">● Filters</button></header>
          <button *ngFor="let document of documents" type="button" [class.active]="selectedDocument().name === document.name" (click)="selectDocument(document.name)">
            <i class="document-color" [attr.data-tone]="document.tone" aria-hidden="true"></i>
            <span><strong>{{ document.displayName }}</strong><small>{{ document.version }} · {{ document.size }} · {{ document.date }}</small><em [attr.data-tone]="document.tone">{{ document.status }}</em></span>
          </button>
        </section>

        <section class="workspace-panel document-preview figma-document-preview">
          <header>
            <div><strong>{{ selectedDocument().displayName }}</strong></div>
            <span class="version-pill">● {{ selectedDocument().version }}</span>
          </header>
          <nav class="preview-tabs" aria-label="Document preview tabs"><button class="active">Preview</button><button>Details</button><button>Versions (3)</button><button>Extraction</button><button>Activity</button></nav>
          <div class="police-report-sheet" role="img" aria-label="Police incident report preview">
            <div class="report-brand"><i aria-hidden="true"></i><strong>CITY OF SPRINGFIELD<br>POLICE DEPARTMENT<br>INCIDENT REPORT</strong></div>
            <h3>INCIDENT INFORMATION</h3>
            <div class="report-rule"></div>
            <p>Driver 1: James Carter<br>Driver 2: Michael Anderson<br>Location: 123 Main St, Springfield, IL<br>Type: Vehicle Collision</p>
            <i class="report-line"></i><i class="report-line"></i><i class="report-line short"></i><i class="report-line"></i><i class="report-line medium"></i>
          </div>
          <section class="ocr-section" aria-labelledby="ocr-title">
            <h3 id="ocr-title">OCR & Extraction Tags</h3>
            <div class="extraction-tags">
              <article><b>Incident Date</b><span>May 19, 2025</span></article>
              <article><b>Location</b><span>123 Main St</span></article>
              <article><b>Incident Type</b><span>Vehicle Collision</span></article>
              <article><b>Officer</b><span>James Thompson</span></article>
              <article><b>Driver 1</b><span>James Carter</span></article>
              <article><b>Policy</b><span>CLM-2025-10291</span></article>
            </div>
            <div class="confidence-row"><span>Confidence Score</span><i><b [style.width.%]="selectedDocument().confidence"></b></i><strong>{{ selectedDocument().confidence }}%</strong></div>
          </section>
        </section>

        <aside class="workspace-panel communication-stream">
          <header><strong>Communication</strong><span>Approvals</span></header>
          <div class="communication-filters"><button class="active">● All</button><button>● Email</button><button>● SMS</button><button>● Notes</button></div>
          <ol>
            <li *ngFor="let item of communications"><i [attr.data-tone]="item.tone"></i><div><strong>{{ item.title }}</strong><span>{{ item.detail }}</span></div><time>{{ item.time }}</time></li>
          </ol>
          <button class="compose-button">● Compose New Message</button>
          <section class="ai-summary-card">
            <header><strong>AI Summary</strong></header>
            <small>Generated from 3 documents</small>
            <dl>
              <div><dt>Incident Overview</dt><dd>Vehicle collision at Main St and 2nd Ave.</dd></div>
              <div><dt>Parties Involved</dt><dd>James Carter and Michael Anderson.</dd></div>
              <div><dt>Key Findings</dt><dd>Driver 2 failed to yield right of way.</dd></div>
              <div><dt>Estimated Damages</dt><dd>$4,730 from repair estimate.</dd></div>
            </dl>
          </section>
        </aside>

        <section class="workspace-panel collaborative-comments">
          <header><strong>Collaborative Comments (3)</strong></header>
          <div class="comment-composer">Add a comment… @mention users</div>
          <article *ngFor="let comment of comments"><i [attr.data-tone]="comment.tone"></i><div><strong>{{ comment.name }}</strong><p>{{ comment.message }}</p><small>May 19, 2025 · {{ comment.time }}</small></div></article>
        </section>

        <aside class="workspace-panel document-integrity">
          <header><strong>Document Integrity</strong></header>
          <div class="integrity-score"><strong>96</strong><span>HIGH CONFIDENCE</span></div>
          <dl><div><dt>OCR coverage</dt><dd>98%</dd></div><div><dt>Entity matching</dt><dd>94%</dd></div><div><dt>Version integrity</dt><dd>100%</dd></div><div><dt>Audit readiness</dt><dd>91%</dd></div></dl>
        </aside>
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
  readonly folders = [
    { label: 'All Documents', count: 128 },
    { label: 'Claim Forms', count: 14 },
    { label: 'Police Reports', count: 6 },
    { label: 'Medical Records', count: 22 },
    { label: 'Photos & Videos', count: 36 },
    { label: 'Estimates', count: 12 },
    { label: 'Correspondence', count: 18 },
    { label: 'Legal', count: 8 },
    { label: 'Other', count: 12 },
    { label: 'Archived', count: 5 },
  ];
  readonly communications = [
    { title: 'Email Sent', detail: 'Request for additional documents…', time: '10:28', tone: 'blue' },
    { title: 'SMS Sent', detail: 'We need your police report…', time: '10:25', tone: 'cyan' },
    { title: 'Email Received', detail: 'Re: additional documents', time: '11:02', tone: 'blue' },
    { title: 'Note Added', detail: 'Extracted key report details.', time: '11:15', tone: 'amber' },
    { title: 'SMS Received', detail: 'I uploaded the police report.', time: '11:16', tone: 'cyan' },
  ];
  readonly comments = [
    { name: 'Alex Morgan', message: 'Reviewed report. Evidence supports liability for Driver 2.', time: '11:15', tone: 'green' },
    { name: 'Sarah Johnson', message: 'Confirm repair estimate is within policy limits.', time: '11:20', tone: 'violet' },
    { name: 'Mike Thompson', message: 'Photos match damage described in the report.', time: '11:25', tone: 'blue' },
  ];

  selectDocument(name: string): void {
    const document = this.documents.find(item => item.name === name);
    if (document) this.selectedDocument.set(document);
  }
}
