const EDGE_TEXT = {
  sync: 'solid blue',
  async: 'dashed blue',
  event: 'dotted coral',
  data: 'solid teal',
  dependency: 'dotted violet',
};

function clean(value, max = 200) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export function buildDiagramImagePrompt(diagram) {
  const nodes = (diagram.nodes || []).map((n) =>
    `- ID: ${clean(n.id, 64)} | ` +
    `LABEL: "${clean(n.label, 100)}" | ` +
    `TYPE: ${clean(n.type, 64)}` +
    (n.description
      ? ` | DESCRIPTION: "${clean(n.description)}"`
      : '')
  );

  const edges = (diagram.edges || []).map((e) =>
    `- ${clean(e.source, 64)} -> ${clean(e.target, 64)} | ` +
    `${EDGE_TEXT[e.type] || EDGE_TEXT.sync} arrow` +
    (e.label ? ` | LABEL: "${clean(e.label, 100)}"` : '')
  );

  return `
Create a professional, visually beautiful system architecture
diagram for Geekly, a developer education platform.

VISUAL STYLE:
- Clean modern technical infographic.
- Light background (#F8FAFC).
- White rounded component cards.
- Subtle cool-grey borders (#D9E3EF).
- Dark navy text (#182235).
- Generous whitespace and subtle shadows.
- Consistent typography and component sizing.
- Crisp vector-style illustration.
- No dark theme, 3D or photorealism.

BRAND COLORS:
Blue #2F80ED, teal #0F8F82, coral #D95D52,
violet #7C5CC4, amber #B7791F.

SEMANTIC COMPONENT ICONS (VERY IMPORTANT):

Use SIMPLE, GENERIC TECHNICAL ICONS based on what each
component DOES, not which technology or product it uses.

The icon must represent the architectural role of the node.

Examples:

- Web/mobile client: Laptop, browser or smartphone.
- API gateway: Network routing / gateway symbol.
- API or REST layer: Server icon.
- GraphQL endpoint: Server or API symbol.
- Application / microservice: Generic server icon.
- Backend service: Server rack or server icon.
- Database: Generic database cylinder.
- Cache: Generic cache / storage icon.
- Message queue: Stacked messages / queue icon.
- Background worker: Gear or processing server.
- Load balancer: Traffic distribution icon.
- Payment service: Payment card icon.
- Object storage: Storage bucket.
- Search service: Magnifying glass.
- Authentication: Shield / lock.
- Monitoring: Activity chart.
- CDN: Distributed network nodes.
- Container: Generic container icon.
- Scheduler: Clock / calendar.
- File storage: Folder / storage icon.

Every icon must be:
- Simple, recognizable and technically meaningful.
- Consistent in size and visual style.
- Placed ONLY inside its corresponding component card.

Never generate standalone icons, icon galleries,
technology showcases, logo collections or decorative symbols.

LAYOUT:
Choose the clearest, most readable arrangement for the supplied
components and connections.

- Keep component cards consistently sized.
- Use an icon on the left and text on the right.
- Align related components naturally.
- Maintain balanced spacing and clear hierarchy.
- Avoid unnecessary empty space.

CONNECTIONS AND CURVES:
Use elegant, smooth Bézier curves instead of rigid
90-degree connectors.

- Prefer smooth cubic Bézier and S-shaped curves.
- Use rounded transitions and natural flowing paths.
- Avoid sharp corners, abrupt turns and angular zigzags.
- Keep connectors short and visually balanced.
- Route connections around component cards.
- Avoid crossing other connections.
- Use clear, small arrowheads.
- Place edge labels close to their corresponding paths.
- Never let connections overlap text or icons.

CONNECTION COLORS:
- sync: Solid blue arrow.
- async: Dashed blue arrow.
- event: Dotted coral arrow.
- data: Solid teal arrow.
- dependency: Dotted violet arrow.

Preserve exact source, target and optional labels.

TEXT:
- Preserve all supplied labels and descriptions exactly.
- Keep text horizontal and readable.
- Do not rename, abbreviate or invent text.
- Display only node labels, descriptions and edge labels.
- No headings, titles or captions.

STRICT CANVAS RULE:
Show ONLY the specified architecture:
components, connections and labels.

No standalone icons, extra components, legends, footers,
watermarks, decorative artwork or additional content.

STRUCTURAL ACCURACY:
The supplied specification is authoritative.

- Include every node exactly once.
- Include every edge exactly once.
- Preserve every source-target relationship.
- Never add, remove, reverse or duplicate connections.
- Never invent infrastructure or relationships.

PRIORITY:
1. Correct architecture and connections.
2. Appropriate generic component icons.
3. Beautiful curved connections.
4. Readable text.
5. Clean professional appearance.

ARCHITECTURE SPECIFICATION

NODES:
${nodes.length ? nodes.join('\n') : 'None'}

CONNECTIONS:
${edges.length ? edges.join('\n') : 'None'}

Generate one complete, polished technical architecture
diagram. Do not add anything outside this specification.
`;
}
