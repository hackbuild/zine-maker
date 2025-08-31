import type { ZineProject, ZinePage, ZineContent } from '@/types';
import { useTemplatesStore } from '@/stores/templates';

export interface MarkdownZineData {
  title: string;
  author?: string;
  description?: string;
  template?: string;
  pages: MarkdownPage[];
}

export interface MarkdownPage {
  title: string;
  content: string;
  images?: { [key: string]: string }; // Image references
}

/**
 * Convert markdown format to Zine Maker project JSON
 * Creates a full zine project from markdown with proper layout and content
 */
export function markdownToProject(markdown: string): ZineProject | null {
  try {
    // Check if this is actually a project JSON disguised as markdown
    if (markdown.trim().startsWith('{')) {
      console.warn('Input appears to be JSON, not markdown. Use JSON input instead.');
      return null;
    }

    const data = parseMarkdown(markdown);
    if (!data) return null;

    const templatesStore = useTemplatesStore();
    // Resolve template id with safe fallbacks
    const requestedId = (data.template || 'quarter-fold-letter').trim();
    const aliasMap: Record<string, string> = {
      'booklet-letter': 'booklet-half-letter-20',
      'accordion-letter': 'accordion-16-letter'
    };
    const resolvedId = aliasMap[requestedId] || requestedId;
    let template = templatesStore.getTemplate(resolvedId) || templatesStore.getTemplate('quarter-fold-letter');
    if (!template) return null;

    // Create pages up to template's page count, filling empty pages if needed
    const pages: ZinePage[] = [];
    const maxPages = template.pageCount;
    
    for (let i = 0; i < maxPages; i++) {
      const pageNumber = i + 1;
      const markdownPage = data.pages[i];
      
      if (markdownPage) {
        // Convert existing markdown page
        pages.push(convertMarkdownPage(markdownPage, pageNumber));
      } else {
        // Create empty page for template structure
        pages.push({
          id: `md-page-${pageNumber}`,
          pageNumber,
          title: `Page ${pageNumber}`,
          backgroundColor: '#ffffff',
          content: []
        });
      }
    }

    const project: ZineProject = {
      id: `md-import-${Date.now()}`,
      name: data.title || 'Imported from Markdown',
      template,
      pages,
      createdAt: new Date(),
      modifiedAt: new Date(),
      metadata: {
        author: data.author || 'Unknown',
        description: data.description || '',
        tags: ['markdown-import']
      }
    };

    return project;
  } catch (error) {
    console.error('Failed to convert markdown to project:', error);
    return null;
  }
}

/**
 * Convert Zine Maker project JSON to markdown format
 */
export function projectToMarkdown(project: ZineProject): string {
  try {
    let markdown = `# ${project.name}\n\n`;
    
    if (project.metadata.author) {
      // author is plain text only; never wrap in extra asterisks
      markdown += `**Author:** ${String(project.metadata.author)}\n`;
    }
    
    if (project.metadata.description) {
      markdown += `**Description:** ${String(project.metadata.description)}\n`;
    }
    
    markdown += `**Template:** ${project.template.id}\n`;
    markdown += `\n---\n\n`;

    // Convert each page
    project.pages.forEach((page) => {
      markdown += convertPageToMarkdown(page);
    });

    return markdown;
  } catch (error) {
    console.error('Failed to convert project to markdown:', error);
    return '';
  }
}

/**
 * Parse markdown text into structured data
 * Robust to either:
 *  - Inline meta lines before a single '---' separator
 *  - YAML-style front matter bounded by '---' ... '---' at the top
 */
function parseMarkdown(markdown: string): MarkdownZineData | null {
  const lines = markdown.split('\n');
  const data: MarkdownZineData = {
    title: '',
    pages: []
  };

  // Helper to parse a metadata line like '**Author:** Name' or 'Author: Name'
  const parseMetaLine = (raw: string) => {
    const line = raw.trim();
    // Strip leading bullet/asterisks formatting
    const cleaned = line.replace(/^\*+\s*/, '');
    const boldMatch = cleaned.match(/^\*\*(.+?)\*\*:\s*(.+)$/i);
    const plainMatch = cleaned.match(/^([A-Za-z_-]+)\s*:\s*(.+)$/);
    const match = boldMatch || plainMatch;
    if (!match) return false;
    const key = match[1].toLowerCase();
    const value = (match[2] || '').trim();
    if (key === 'title' && !data.title) data.title = value;
    else if (key === 'author') data.author = value;
    else if (key === 'description') data.description = value;
    else if (key === 'template') data.template = value;
    else return false;
    return true;
  };

  // Phase 1: parse top matter (title + meta) until first page header '## '
  let i = 0;
  let seenYamlFenceCount = 0;
  for (; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '---') {
      seenYamlFenceCount++;
      continue; // treat as separator/fence; we don't enter a special mode
    }
    if (line.startsWith('## ')) break; // stop meta parsing when pages begin
    if (!data.title && line.startsWith('# ')) {
      data.title = line.substring(2).trim();
      continue;
    }
    // Parse metadata lines opportunistically
    parseMetaLine(line);
  }

  // Phase 2: parse pages from the remainder
  let currentPage: MarkdownPage | null = null;
  let pageContent: string[] = [];
  for (; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (line === '---') {
      // treat as simple separator inside content; keep as a blank line
      if (currentPage) pageContent.push('');
      continue;
    }
    if (line.startsWith('## ')) {
      // Save previous page
      if (currentPage) {
        currentPage.content = pageContent.join('\n').trim();
        if (currentPage.content || currentPage.title) data.pages.push(currentPage);
      }
      currentPage = { title: line.substring(3).trim(), content: '' };
      pageContent = [];
      continue;
    }
    if (currentPage) {
      pageContent.push(raw); // Preserve original formatting
    }
  }

  // Save last page
  if (currentPage) {
    currentPage.content = pageContent.join('\n').trim();
    if (currentPage.content || currentPage.title) data.pages.push(currentPage);
  }

  return (data.title || data.pages.length > 0) ? data : null;
}

/**
 * Convert markdown page to ZinePage
 */
function convertMarkdownPage(mdPage: MarkdownPage, pageNumber: number): ZinePage {
  const content: ZineContent[] = [];
  let yPosition = 20;
  const pageWidth = 198; // Quarter-fold width
  const pageHeight = 306; // Quarter-fold height

  // Add title as large text if it's not already in the content
  if (mdPage.title && !mdPage.content.includes(mdPage.title)) {
    content.push({
      id: `page-${pageNumber}-title`,
      type: 'text',
      x: 10,
      y: yPosition,
      width: pageWidth - 20,
      height: 30,
      rotation: 0,
      zIndex: Date.now(),
      properties: {
        text: mdPage.title,
        fontSize: 18,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: '#10B981',
        textAlign: 'left',
        lineHeight: 1.2,
        textDecoration: 'none',
        padding: 0
      }
    });
    yPosition += 40;
  }

  // Parse content and convert to elements
  const lines = mdPage.content.split('\n');
  let currentText = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Handle images
    const imageMatch = trimmedLine.match(/!\[(.*?)\]\((.*?)\)/);
    if (imageMatch) {
      // Add any accumulated text first
      if (currentText) {
        const textElement = createTextContent(currentText, yPosition, pageWidth, pageNumber);
        content.push(textElement);
        yPosition += textElement.height + 10;
        currentText = '';
      }
      
      // Add image element
      const [, alt, src] = imageMatch;
      const imageHeight = 80; // Default image height
      
      if (yPosition + imageHeight < pageHeight - 20) { // Check if image fits
        content.push({
          id: `page-${pageNumber}-img-${Date.now()}`,
          type: 'image',
          x: 10,
          y: yPosition,
          width: Math.min(pageWidth - 20, 120),
          height: imageHeight,
          rotation: 0,
          zIndex: Date.now(),
          properties: {
            src,
            alt: alt || 'Image',
            opacity: 1
          }
        });
        yPosition += imageHeight + 15;
      }
      continue;
    }
    
    // Handle headers (### becomes bold text)
    if (trimmedLine.startsWith('### ')) {
      if (currentText) {
        const textElement = createTextContent(currentText, yPosition, pageWidth, pageNumber);
        content.push(textElement);
        yPosition += textElement.height + 10;
        currentText = '';
      }
      
      const headerText = trimmedLine.substring(4);
      const headerElement = createTextContent(`**${headerText}**`, yPosition, pageWidth, pageNumber);
      content.push(headerElement);
      yPosition += headerElement.height + 10;
      continue;
    }
    
    // Handle empty lines
    if (trimmedLine === '') {
      if (currentText) {
        const textElement = createTextContent(currentText, yPosition, pageWidth, pageNumber);
        content.push(textElement);
        yPosition += textElement.height + 15;
        currentText = '';
      }
    } else {
      // Accumulate text
      currentText += (currentText ? '\n' : '') + line;
    }
  }

  // Add remaining text
  if (currentText) {
    content.push(createTextContent(currentText, yPosition, pageWidth, pageNumber));
  }

  return {
    id: `md-page-${pageNumber}`,
    pageNumber,
    title: mdPage.title,
    backgroundColor: '#ffffff',
    content
  };
}

/**
 * Create text content element
 */
function createTextContent(text: string, y: number, pageWidth: number, pageNumber: number): ZineContent {
  // Clean up markdown formatting but preserve structure
  let cleanText = text;
  let fontSize = 13;
  let fontWeight: 'normal' | 'bold' = 'normal';
  let color = '#111111';
  
  // Handle bold headers
  if (text.startsWith('**') && text.endsWith('**')) {
    cleanText = text.slice(2, -2);
    fontSize = 16;
    fontWeight = 'bold';
    color = '#10B981';
  } else {
    // Handle inline formatting but keep the text readable
    cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers but keep text
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic markers but keep text
      .replace(/`(.*?)`/g, '$1')       // Remove code markers but keep text
  }
  
  // Calculate height based on content
  const lines = cleanText.split('\n');
  const estimatedHeight = Math.max(20, lines.length * (fontSize * 1.4));
  
  return {
    id: `page-${pageNumber}-text-${Date.now()}-${Math.random()}`,
    type: 'text',
    x: 10,
    y,
    width: pageWidth - 20,
    height: estimatedHeight,
    rotation: 0,
    zIndex: Date.now(),
    properties: {
      text: cleanText,
      fontSize,
      fontFamily: 'Arial',
      fontWeight,
      fontStyle: 'normal',
      color,
      textAlign: 'left',
      lineHeight: 1.2,
      textDecoration: 'none',
      padding: 0
    }
  };
}

/**
 * Convert ZinePage to markdown
 */
function convertPageToMarkdown(page: ZinePage): string {
  let markdown = `## ${page.title}\n\n`;

  // Sort content by position (top to bottom)
  const sortedContent = [...page.content].sort((a, b) => a.y - b.y);

  for (const content of sortedContent) {
    if (content.type === 'text') {
      const props = content.properties as any;
      let text = typeof props.text === 'string' ? props.text : '';
      // Skip whitespace-only text nodes to avoid generating '** **' noise
      if (text.replace(/\s/g, '') === '') {
        continue;
      }
      
      // Add markdown formatting based on properties
      if (props.fontWeight === 'bold' && props.fontSize > 16) {
        // Large bold text becomes header
        text = `### ${text}`;
      } else if (props.fontWeight === 'bold') {
        const core = text.trim();
        if (core.length > 0) text = `**${core}**`;
      }
      if (props.fontStyle === 'italic') {
        const core = text.trim();
        if (core.length > 0) text = `*${core}*`;
      }
      
      markdown += `${text}\n\n`;
    } else if (content.type === 'image') {
      const props = content.properties as any;
      // Include image as markdown reference
      markdown += `![${props.alt || 'Image'}](${props.src})\n\n`;
    } else if (content.type === 'shape') {
      const props = content.properties as any;
      // Include shape as description
      markdown += `*[${props.shapeType} shape: ${props.fill}]*\n\n`;
    } else if (content.type === 'drawing') {
      // Include drawing as description
      markdown += `*[Hand-drawn element]*\n\n`;
    }
  }

  return markdown;
}

/**
 * Validate if string is valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate if JSON is a valid Zine Maker project
 */
export function isValidZineProject(json: any): boolean {
  // Handle both wrapped format { project: {...}, assets: [] } and direct project format
  const project = json.project || json;
  
  return project && 
         project.id && 
         project.name && 
         project.template && 
         Array.isArray(project.pages);
}
