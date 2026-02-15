window.chaptersData = window.chaptersData || [];
window.chaptersData.push({
    id: 1,
    title: "HTML Basics",
    description: "Learn the fundamental building blocks of HTML including tags, elements, and document structure.",
    icon: "fas fa-home",
    lessons: 6,
    duration: "2 hours",
    lessonsList: [
        {
            id: 1,
            title: "Introduction to HTML",
            duration: "15 min",
            completed: true,
            content: `
            <h1 class="lesson-title">Introduction to HTML</h1>
            <div class="lesson-body">
            <p>HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page and consists of a series of elements that tell the browser how to display content.</p>
            <h3>What is HTML?</h3>
            <ul>
            <li><strong>HTML stands for HyperText Markup Language</strong></li>
            <li>HTML is the standard markup language for creating Web pages</li>
            <li>HTML describes the structure of a Web page</li>
            <li>HTML consists of a series of elements</li>
            <li>HTML elements tell the browser how to display the content</li>
            </ul>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-code"></i> Basic HTML Document Structure</div>
            <div class="code-block">
            &lt;!DOCTYPE html&gt;
            &lt;html&gt;
            &lt;head&gt;
            &lt;title&gt;My First Web Page&lt;/title&gt;
            &lt;/head&gt;
            &lt;body&gt;
            &lt;h1&gt;Hello, World!&lt;/h1&gt;
            &lt;p&gt;This is my first HTML page.&lt;/p&gt;
            &lt;/body&gt;
            &lt;/html&gt;
            </div>
            </div>
            <h3>HTML Elements</h3>
            <p>An HTML element is defined by a start tag, some content, and an end tag:</p>
            <div class="code-block">
            &lt;tagname&gt;Content goes here...&lt;/tagname&gt;
            </div>
            <p>Examples of HTML elements:</p>
            <div class="code-block">
            &lt;h1&gt;My Heading&lt;/h1&gt;
            &lt;p&gt;My paragraph.&lt;/p&gt;
            &lt;a href="https://www.example.com"&gt;This is a link&lt;/a&gt;
            </div>
            <h3>Key Points to Remember</h3>
            <ol>
            <li>HTML is not a programming language; it's a markup language</li>
            <li>HTML uses tags to define elements</li>
            <li>Browsers don't display HTML tags, but use them to render content</li>
            <li>HTML documents have a .html or .htm extension</li>
            </ol>
            </div>`
        },
        {
            id: 2,
            title: "HTML Document Structure",
            duration: "20 min",
            completed: true,
            content: `
            <h1 class="lesson-title">HTML Document Structure</h1>
            <div class="lesson-body">
            <p>Every HTML document has a specific structure that browsers understand.</p>
            <h3>The DOCTYPE Declaration</h3>
            <p>The <code>&lt;!DOCTYPE&gt;</code> declaration defines the document type and version of HTML.</p>
            <div class="code-block">
            &lt;!DOCTYPE html&gt;
            </div>
            <p>This declaration helps browsers to display web pages correctly.</p>
            <h3>HTML Document Structure</h3>
            <p>A well-structured HTML document contains the following elements:</p>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-file-code"></i> Complete HTML5 Document Structure</div>
            <div class="code-block">
            &lt;!DOCTYPE html&gt;
            &lt;html lang="en"&gt;
            &lt;head&gt;
            &lt;meta charset="UTF-8"&gt;
            &lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;
            &lt;title&gt;Document Title&lt;/title&gt;
            &lt;!-- CSS links, icons, and other meta tags go here --&gt;
            &lt;/head&gt;
            &lt;body&gt;
            &lt;!-- All visible content goes here --&gt;
            &lt;h1&gt;Main Heading&lt;/h1&gt;
            &lt;p&gt;Paragraph text.&lt;/p&gt;
            &lt;/body&gt;
            &lt;/html&gt;
            </div>
            </div>
            <h3>The &lt;html&gt; Element</h3>
            <p>The <code>&lt;html&gt;</code> element is the root element of an HTML page.</p>
            <div class="code-block">
            &lt;html lang="en"&gt;
            &lt;!-- Content goes here --&gt;
            &lt;/html&gt;
            </div>
            <h3>The &lt;head&gt; Element</h3>
            <p>The <code>&lt;head&gt;</code> element contains meta information about the HTML document.</p>
            <ul>
            <li><code>&lt;title&gt;</code> - Defines the title shown in browser tab</li>
            <li><code>&lt;meta&gt;</code> - Defines metadata like character set, viewport settings</li>
            <li><code>&lt;link&gt;</code> - Links to external resources like CSS files</li>
            <li><code>&lt;style&gt;</code> - Contains internal CSS styles</li>
            <li><code>&lt;script&gt;</code> - Contains or links to JavaScript code</li>
            </ul>
            <h3>The &lt;body&gt; Element</h3>
            <p>The <code>&lt;body&gt;</code> element contains all the visible content of the web page:</p>
            <div class="code-block">
            &lt;body&gt;
            &lt;h1&gt;This is a heading&lt;/h1&gt;
            &lt;p&gt;This is a paragraph.&lt;/p&gt;
            &lt;div&gt;This is a division/container.&lt;/div&gt;
            &lt;/body&gt;
            </div>
            </div>`
        },
        {
            id: 3,
            title: "HTML Tags and Elements",
            duration: "25 min",
            completed: false,
            content: `
            <h1 class="lesson-title">HTML Tags and Elements</h1>
            <div class="lesson-body">
            <p>HTML tags are the building blocks of HTML pages.</p>
            <h3>HTML Tags vs Elements</h3>
            <p><strong>HTML Tags:</strong> Keywords surrounded by angle brackets: <code>&lt;tagname&gt;</code></p>
            <p><strong>HTML Elements:</strong> A start tag, content, and an end tag: <code>&lt;tagname&gt;content&lt;/tagname&gt;</code></p>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-tags"></i> HTML Element Example</div>
            <div class="code-block">
            &lt;p&gt;This is a paragraph element.&lt;/p&gt;
            </div>
            <p>In this example: <code>&lt;p&gt;</code> is the opening tag, "This is a paragraph element." is the content, and <code>&lt;/p&gt;</code> is the closing tag.</p>
            </div>
            <h3>Empty Elements (Void Elements)</h3>
            <p>Some HTML elements have no content and no closing tag:</p>
            <div class="code-block">
            &lt;br&gt;          &lt;!-- Line break --&gt;
            &lt;hr&gt;          &lt;!-- Horizontal rule --&gt;
            &lt;img&gt;         &lt;!-- Image --&gt;
            &lt;input&gt;       &lt;!-- Input field --&gt;
            &lt;meta&gt;        &lt;!-- Metadata --&gt;
            &lt;link&gt;        &lt;!-- Link to external resource --&gt;
            </div>
            <h3>Common HTML Tags</h3>
            <p>Here are some of the most frequently used HTML tags:</p>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-list"></i> Common HTML Tags</div>
            <div class="code-block">
            &lt;h1&gt; to &lt;h6&gt;  &lt;!-- Headings (h1 is largest) --&gt;
            &lt;p&gt;           &lt;!-- Paragraph --&gt;
            &lt;a&gt;           &lt;!-- Anchor (link) --&gt;
            &lt;img&gt;         &lt;!-- Image --&gt;
            &lt;div&gt;         &lt;!-- Division/container --&gt;
            &lt;span&gt;        &lt;!-- Inline container --&gt;
            &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt; &lt;!-- Lists --&gt;
            &lt;table&gt;, &lt;tr&gt;, &lt;td&gt; &lt;!-- Tables --&gt;
            &lt;form&gt;, &lt;input&gt;, &lt;button&gt; &lt;!-- Forms --&gt;
            </div>
            </div>
            <h3>HTML Attributes</h3>
            <p>Attributes provide additional information about elements:</p>
            <div class="code-block">
            &lt;tag attribute="value"&gt;content&lt;/tag&gt;
            </div>
            <p>Examples of attributes:</p>
            <div class="code-block">
            &lt;a href="https://example.com"&gt;Visit Example&lt;/a&gt;
            &lt;img src="image.jpg" alt="Description"&gt;
            &lt;p class="intro" id="first-paragraph"&gt;This is a paragraph.&lt;/p&gt;
            </div>
            <h3>Common Attributes</h3>
            <ul>
            <li><code>id</code> - Specifies a unique id for an element</li>
            <li><code>class</code> - Specifies one or more class names for an element</li>
            <li><code>src</code> - Specifies the source file path</li>
            <li><code>href</code> - Specifies the URL of a link</li>
            <li><code>alt</code> - Specifies alternative text for images</li>
            <li><code>style</code> - Specifies inline CSS styles</li>
            <li><code>title</code> - Specifies extra information about an element</li>
            </ul>
            </div>`
        },
        {
            id: 4,
            title: "Headings and Paragraphs",
            duration: "15 min",
            completed: false,
            content: `
            <h1 class="lesson-title">Headings and Paragraphs</h1>
            <div class="lesson-body">
            <p>Headings and paragraphs are the most basic elements for structuring text.</p>
            <h3>HTML Headings</h3>
            <p>HTML provides six levels of headings, from <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code>.</p>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-heading"></i> Heading Examples</div>
            <div class="code-block">
            &lt;h1&gt;This is Heading 1&lt;/h1&gt;
            &lt;h2&gt;This is Heading 2&lt;/h2&gt;
            &lt;h3&gt;This is Heading 3&lt;/h3&gt;
            &lt;h4&gt;This is Heading 4&lt;/h4&gt;
            &lt;h5&gt;This is Heading 5&lt;/h5&gt;
            &lt;h6&gt;This is Heading 6&lt;/h6&gt;
            </div>
            </div>
            <h3>Best Practices for Headings</h3>
            <ul>
            <li>Use <code>&lt;h1&gt;</code> for the main title of the page</li>
            <li>Use headings to create a logical document structure</li>
            <li>Don't skip heading levels</li>
            <li>Search engines use headings to index the structure of your content</li>
            </ul>
            <h3>HTML Paragraphs</h3>
            <p>The <code>&lt;p&gt;</code> element defines a paragraph.</p>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-paragraph"></i> Paragraph Examples</div>
            <div class="code-block">
            &lt;p&gt;This is a paragraph. It contains text that forms a coherent block of content.&lt;/p&gt;
            &lt;p&gt;This is another paragraph. HTML will automatically separate paragraphs with space.&lt;/p&gt;
            &lt;p&gt;This is a third paragraph with &lt;strong&gt;bold text&lt;/strong&gt; and &lt;em&gt;italic text&lt;/em&gt;.&lt;/p&gt;
            </div>
            </div>
            <h3>Text Formatting Elements</h3>
            <p>HTML provides several elements for formatting text:</p>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-text-height"></i> Text Formatting Examples</div>
            <div class="code-block">
            &lt;p&gt;
            &lt;b&gt;This text is bold&lt;/b&gt;&lt;br&gt;
            &lt;strong&gt;This text is strongly important&lt;/strong&gt;&lt;br&gt;
            &lt;i&gt;This text is italic&lt;/i&gt;&lt;br&gt;
            &lt;em&gt;This text is emphasized&lt;/em&gt;&lt;br&gt;
            &lt;mark&gt;This text is marked/highlighted&lt;/mark&gt;&lt;br&gt;
            &lt;small&gt;This text is smaller&lt;/small&gt;&lt;br&gt;
            &lt;del&gt;This text is deleted&lt;/del&gt;&lt;br&gt;
            &lt;ins&gt;This text is inserted&lt;/ins&gt;&lt;br&gt;
            &lt;sub&gt;This text is subscript&lt;/sub&gt;
            &lt;sup&gt;This text is superscript&lt;/sup&gt;
            &lt;/p&gt;
            </div>
            </div>
            <h3>Line Breaks and Horizontal Rules</h3>
            <p>Use <code>&lt;br&gt;</code> for line breaks and <code>&lt;hr&gt;</code> for thematic breaks:</p>
            <div class="code-block">
            &lt;p&gt;This is the first line.&lt;br&gt;
            This is the second line after a break.&lt;/p&gt;
            &lt;hr&gt;
            &lt;p&gt;This content is separated by a horizontal rule.&lt;/p&gt;
            </div>
            </div>`
        },
        {
            id: 5,
            title: "Links and Images",
            duration: "25 min",
            completed: false,
            content: `
            <h1 class="lesson-title">Links and Images</h1>
            <div class="lesson-body">
            <p>Links and images are essential for creating engaging web pages.</p>
            <h3>HTML Links - The &lt;a&gt; Element</h3>
            <p>The HTML <code>&lt;a&gt;</code> element creates hyperlinks.</p>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-link"></i> Basic Link Examples</div>
            <div class="code-block">
            &lt;a href="https://www.example.com"&gt;Visit Example.com&lt;/a&gt;
            &lt;a href="page.html"&gt;Go to another page&lt;/a&gt;
            &lt;a href="#section2"&gt;Jump to Section 2&lt;/a&gt;
            &lt;a href="mailto:someone@example.com"&gt;Send Email&lt;/a&gt;
            </div>
            </div>
            <h3>Link Attributes</h3>
            <p>The <code>href</code> attribute specifies the destination address.</p>
            <ul>
            <li><code>target</code> - Specifies where to open the linked document
            <ul>
            <li><code>_blank</code> - Opens in a new window/tab</li>
            <li><code>_self</code> - Opens in the same frame (default)</li>
            </ul>
            </li>
            <li><code>title</code> - Provides additional information about the link</li>
            <li><code>rel</code> - Specifies the relationship between documents</li>
            <li><code>download</code> - Specifies that the target will be downloaded</li>
            </ul>
            <div class="code-block">
            &lt;a href="document.pdf" target="_blank" title="Open PDF in new window"&gt;Download PDF&lt;/a&gt;
            &lt;a href="image.jpg" download="my-image.jpg"&gt;Download Image&lt;/a&gt;
            &lt;a href="https://example.com" rel="noopener noreferrer"&gt;External Link&lt;/a&gt;
            </div>
            <h3>HTML Images - The &lt;img&gt; Element</h3>
            <p>The HTML <code>&lt;img&gt;</code> element is used to embed images.</p>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-image"></i> Image Examples</div>
            <div class="code-block">
            &lt;img src="photo.jpg" alt="A beautiful sunset"&gt;
            &lt;img src="images/logo.png" alt="Company logo" width="200" height="100"&gt;
            &lt;img src="https://www.example.com/image.jpg" alt="Remote image"&gt;
            </div>
            </div>
            <h3>Essential Image Attributes</h3>
            <ul>
            <li><code>src</code> - Specifies the path to the image (required)</li>
            <li><code>alt</code> - Specifies alternative text (required for accessibility)</li>
            <li><code>width</code> - Specifies the width in pixels</li>
            <li><code>height</code> - Specifies the height in pixels</li>
            <li><code>title</code> - Provides additional information</li>
            </ul>
            <h3>Image Formats for Web</h3>
            <ul>
            <li><strong>JPEG/JPG</strong> - Best for photographs</li>
            <li><strong>PNG</strong> - Best for images with transparency</li>
            <li><strong>GIF</strong> - Best for simple animations</li>
            <li><strong>SVG</strong> - Vector format that scales without quality loss</li>
            <li><strong>WebP</strong> - Modern format with excellent compression</li>
            </ul>
            <h3>Image as a Link</h3>
            <p>Make an image clickable by wrapping it with an <code>&lt;a&gt;</code> element:</p>
            <div class="code-block">
            &lt;a href="large-image.jpg"&gt;
            &lt;img src="thumbnail.jpg" alt="View larger version"&gt;
            &lt;/a&gt;
            </div>
            </div>`
        },
        {
            id: 6,
            title: "HTML Lists",
            duration: "20 min",
            completed: false,
            content: `
            <h1 class="lesson-title">HTML Lists</h1>
            <div class="lesson-body">
            <p>HTML lists allow you to group related items together.</p>
            <h3>Unordered Lists</h3>
            <p>Unordered lists are used for items where order doesn't matter.</p>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-list-ul"></i> Unordered List Example</div>
            <div class="code-block">
            &lt;ul&gt;
            &lt;li&gt;Coffee&lt;/li&gt;
            &lt;li&gt;Tea&lt;/li&gt;
            &lt;li&gt;Milk&lt;/li&gt;
            &lt;/ul&gt;
            </div>
            </div>
            <h3>Ordered Lists</h3>
            <p>Ordered lists are used for items where sequence matters.</p>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-list-ol"></i> Ordered List Example</div>
            <div class="code-block">
            &lt;ol&gt;
            &lt;li&gt;Preheat the oven&lt;/li&gt;
            &lt;li&gt;Mix ingredients&lt;/li&gt;
            &lt;li&gt;Bake for 30 minutes&lt;/li&gt;
            &lt;/ol&gt;
            </div>
            </div>
            <h3>Description Lists</h3>
            <p>Description lists are used for terms and their descriptions.</p>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-list-alt"></i> Description List Example</div>
            <div class="code-block">
            &lt;dl&gt;
            &lt;dt&gt;HTML&lt;/dt&gt;
            &lt;dd&gt;HyperText Markup Language&lt;/dd&gt;
            &lt;dt&gt;CSS&lt;/dt&gt;
            &lt;dd&gt;Cascading Style Sheets&lt;/dd&gt;
            &lt;dt&gt;JavaScript&lt;/dt&gt;
            &lt;dd&gt;A programming language for the web&lt;/dd&gt;
            &lt;/dl&gt;
            </div>
            </div>
            <h3>Nested Lists</h3>
            <p>Lists can be nested inside other lists:</p>
            <div class="example-box">
            <div class="lesson-example-title"><i class="fas fa-sitemap"></i> Nested List Example</div>
            <div class="code-block">
            &lt;ul&gt;
            &lt;li&gt;Fruits
            &lt;ul&gt;
            &lt;li&gt;Apples&lt;/li&gt;
            &lt;li&gt;Oranges&lt;/li&gt;
            &lt;li&gt;Bananas&lt;/li&gt;
            &lt;/ul&gt;
            &lt;/li&gt;
            &lt;li&gt;Vegetables
            &lt;ul&gt;
            &lt;li&gt;Carrots&lt;/li&gt;
            &lt;li&gt;Broccoli&lt;/li&gt;
            &lt;li&gt;Spinach&lt;/li&gt;
            &lt;/ul&gt;
            &lt;/li&gt;
            &lt;/ul&gt;
            </div>
            </div>
            <h3>Common Use Cases for Lists</h3>
            <ul>
            <li><strong>Navigation menus</strong> - Using unordered lists for site navigation</li>
            <li><strong>Step-by-step instructions</strong> - Using ordered lists for procedures</li>
            <li><strong>Feature lists</strong> - Using unordered lists for product features</li>
            <li><strong>Glossaries</strong> - Using description lists for terms and definitions</li>
            <li><strong>Table of contents</strong> - Using nested lists for hierarchical content</li>
            </ul>
            </div>`
        }
    ]
});