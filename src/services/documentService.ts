export interface Document {
  id: string;
  title: string;
  url: string;
  content: string;
  sections: DocumentSection[];
  tags: string[];
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  level: number; // heading level (h1, h2, etc.)
}

class DocumentService {
  private documents: Document[] = [];
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.loadDocuments();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize document service:', error);
      throw error;
    }
  }

  private async loadDocuments(): Promise<void> {
    // List of known documents in the public/documents folder
    // In a more dynamic implementation, we could fetch the directory listing
    const documentFiles = [
      'aprons-and-totes-shop_2.html',
      'class-12-senior-project_1.html',
      'class-8-project_1.html',
      'class-plays-by-grade-list_1.html',
      'doll-making-in-waldorf-education_1.html',
      'eurythmy-in-waldorf-education_1.html',
      'festivals-in-waldorf-education.html',
      'foreign-language-teaching-in-waldorf_1.html',
      'form-drawing-in-waldorf-education_1.html',
      'handwork_1.html',
      'handwork-in-waldorf-education_6.html',
      'is-waldorf-for-our-family_1.html',
      'main-lesson-class-2_1.html',
      'main-lesson-class-3_1.html',
      'main-lesson-class-4_1.html',
      'main-lesson-class-5_1.html',
      'main-lesson-class-7_1.html',
      'main-lesson-class-8_1.html',
      'main-lesson-overview_1.html',
      'nutrition-in-waldorf-education.html',
      'orchestra-instrumental-music-in-waldorf-education_1.html',
      'puppetry-in-waldorf-education_2.html',
      'special-needs-neurodivergence-in-waldorf_1.html',
      'the-living-word-storytelling.html',
      'waldorf-audiobook-and-podcast-list_1.html',
      'waldorf-fonts-lutz-baar_1.html',
      'waldorf-watercolor-wet-on-wet_4.html',
      'Waldorf_Watercolor_Painting_2.html',
      'woodwork-in-waldorf-education_1.html',
      'writing-tools-and-cursive-in-waldorf_1.html'
    ];

    console.log(`Loading ${documentFiles.length} documents...`);

    // Load each document
    for (const fileName of documentFiles) {
      try {
        const document = await this.loadAndParseDocument(fileName);
        if (document) {
          this.documents.push(document);
        }
      } catch (error) {
        console.warn(`Failed to load document ${fileName}:`, error);
        // Continue with other documents
      }
    }

    console.log(`Loaded ${this.documents.length} documents successfully`);
  }

  private async loadAndParseDocument(fileName: string): Promise<Document | null> {
    try {
      const response = await fetch(`/documents/${fileName}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const htmlContent = await response.text();
      return this.parseHtmlDocument(htmlContent, fileName);
    } catch (error) {
      console.error(`Error loading ${fileName}:`, error);
      return null;
    }
  }

  private parseHtmlDocument(htmlContent: string, fileName: string): Document {
    // Create a DOM parser to extract content
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Remove script and style elements to get clean text
    const scripts = doc.getElementsByTagName('script');
    while (scripts.length > 0) {
      scripts[0].parentNode?.removeChild(scripts[0]);
    }
    
    const styles = doc.getElementsByTagName('style');
    while (styles.length > 0) {
      styles[0].parentNode?.removeChild(styles[0]);
    }
    
    // Extract title
    const titleElement = doc.querySelector('title');
    const title = titleElement ? titleElement.textContent?.trim() || fileName : fileName;
    
    // Extract main content - try to find the main article/content area
    let contentElement = doc.querySelector('main, article, .content, #content, .container');
    if (!contentElement) {
      // Fallback to body if no specific content container found
      contentElement = doc.body;
    }
    
    // Get text content
    const fullText = contentElement ? contentElement.textContent || '' : '';
    
    // Extract sections based on headings
    const sections = this.extractSections(contentElement || doc.body);
    
    // Generate tags from content (simplified)
    const tags = this.generateTags(title, fullText);
    
    return {
      id: fileName.replace('.html', ''),
      title,
      url: `/documents/${fileName}`,
      content: fullText,
      sections,
      tags
    };
  }

  private extractSections(rootElement: Element): DocumentSection[] {
    const sections: DocumentSection[] = [];
    let sectionId = 0;
    
    // Find all heading elements
    const headings = rootElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.substring(1)); // Get number from h1, h2, etc.
      
      // Get content until next heading of same or higher level
      let content = '';
      let current = heading.nextElementSibling;
      
      while (current && !(current.matches('h1, h2, h3, h4, h5, h6') && 
                         parseInt(current.tagName.substring(1)) <= level)) {
        if (current.nodeType === Node.ELEMENT_NODE) {
          content += current.textContent || '';
        }
        current = current.nextElementSibling;
      }
      
      sections.push({
        id: `section-${sectionId++}`,
        title: heading.textContent?.trim() || `Section ${index + 1}`,
        content: content.trim(),
        level
      });
    });
    
    // If no headings found, create a single section with all content
    if (sections.length === 0) {
      const fullText = rootElement.textContent?.trim() || '';
      if (fullText) {
        sections.push({
          id: 'section-0',
          title: 'Full Content',
          content: fullText,
          level: 1
        });
      }
    }
    
    return sections;
  }

  private generateTags(title: string, content: string): string[] {
    const text = (title + ' ' + content).toLowerCase();
    const words = text.match(/\b[a-z]{3,}\b/g) || [];
    const stopWords = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'are', 'was', 'were', 'been', 'have', 'has', 'had', 'not', 'but', 'all', 'can', 'each', 'its', 'than', 'they', 'you', 'our', 'your', 'her', 'his', 'him', 'she', 'who', 'which', 'what', 'where', 'when', 'why', 'how', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'into', 'over', 'also', 'very', 'just', 'more', 'some', 'such', 'only', 'other', 'about', 'after', 'before', 'between', 'through', 'during', 'without', 'within', 'along', 'being', 'made', 'make', 'does', 'done', 'used', 'using', 'use', 'get', 'got', 'one', 'two', 'way', 'well', 'back', 'still', 'even', 'much', 'many']);
    
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      if (stopWords.has(word)) return;
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const sortedWords = Object.entries(wordCount)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 10)
      .map(([word]) => word);
    
    return sortedWords;
  }

  async searchDocuments(query: string): Promise<Document[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    if (!query.trim()) {
      return [];
    }
    
    const queryLower = query.toLowerCase().trim();
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
    
    // Score each document based on matches
    const scoredDocuments: { document: Document; score: number }[] = [];
    
    for (const doc of this.documents) {
      let score = 0;
      
      // Check title matches
      const titleLower = doc.title.toLowerCase();
      queryWords.forEach(word => {
        if (titleLower.includes(word)) {
          score += 3; // Title matches are more important
        }
      });
      
      // Check content matches
      const contentLower = doc.content.toLowerCase();
      queryWords.forEach(word => {
        if (contentLower.includes(word)) {
          score += 1;
        }
      });
      
      // Check tag matches
      doc.tags.forEach(tag => {
        queryWords.forEach(word => {
          if (tag.toLowerCase().includes(word)) {
            score += 2; // Tag matches are moderately important
          }
        });
      });
      
      // Check section title matches
      doc.sections.forEach(section => {
        const sectionTitleLower = section.title.toLowerCase();
        queryWords.forEach(word => {
          if (sectionTitleLower.includes(word)) {
            score += 2;
          }
        });
      });
      
      if (score > 0) {
        scoredDocuments.push({ document: doc, score });
      }
    }
    
    // Sort by score (descending) and return documents
    return scoredDocuments
      .sort((a, b) => b.score - a.score)
      .map(item => item.document);
  }

  async getDocumentById(id: string): Promise<Document | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return this.documents.find(doc => doc.id === id) || null;
  }

  async getAllDocuments(): Promise<Document[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    return [...this.documents]; // Return a copy
  }
}

export const documentService = new DocumentService();