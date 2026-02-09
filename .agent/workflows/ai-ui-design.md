---
description: Generate UI components from natural language using Pencil.dev MCP and M3 Agency design system
turbo: all
---

# AI UI Design Workflow

Transform natural language prompts into production-ready UI components using Pencil.dev patterns and the M3 Agency design system.

## Workflow Steps

### Step 1: Parse User Prompt

**Input:** Natural language description of desired component

**Process:**
1. Identify component type (button, card, table, hero, pricing, etc.)
2. Extract required properties (colors, text, layout, dimensions)
3. Determine variant (filled, outlined, elevated, etc.)
4. List content elements (headings, body text, images, icons)

**Example:**
```
Input: "Create a pricing card for Professional plan at $99/month"
Output:
  - Type: pricing_card
  - Variant: outlined
  - Content: plan name, price, period, features list, CTA button
  - Properties: centered text, primary color accent
```

### Step 2: Match Components to Design System

**Input:** Parsed component requirements

**Process:**
1. Load design tokens from `.agent/designs/design-tokens.yaml`
2. Match colors to palette:
   - Primary: #006A60 (Mekong Teal)
   - Secondary: #9C6800 (Sa Đéc Gold)
   - Tertiary: #6750A4 (Accent Purple)
3. Select typography scale:
   - Titles: headline_medium (28px)
   - Price: display_small (36px)
   - Features: body_medium (14px)
4. Apply spacing (multiples of 4: 8, 16, 24, 32)
5. Choose shape tokens (corner_large: 16px)

**Example:**
```yaml
matched_tokens:
  card_fill: "#FAFDFC"  # surface
  card_stroke: "#BEC9C6"  # outline_variant
  title_font: "headline_medium"
  price_color: "#006A60"  # primary
  padding: 16
  corner_radius: 16
```

### Step 3: Generate Component Specification

**Input:** Matched design tokens

**Process:**
1. Create hierarchical component structure
2. Define parent frame with layout properties
3. Add child elements (text, icons, buttons)
4. Apply styling from design tokens
5. Ensure accessibility (contrast, touch targets)

**Example:**
```yaml
component_spec:
  type: frame
  name: pricing_card_professional
  layout: vertical
  padding: 16
  fill: "#FAFDFC"
  stroke: "#BEC9C6"
  strokeThickness: 1
  cornerRadius: 16
  children:
    - type: text
      name: plan_name
      content: "Professional"
      fontSize: 28
      fontWeight: 500
      textAlign: center
    - type: text
      name: price
      content: "$99"
      fontSize: 36
      fontWeight: 700
      textColor: "#006A60"
      textAlign: center
    - type: text
      name: period
      content: "/month"
      fontSize: 14
      textColor: "#3F4946"
    - type: frame
      name: features
      layout: vertical
      gap: 8
      children:
        - type: text
          content: "✓ Advanced analytics"
    - type: ref
      ref: button_component
      variant: outlined
```

### Step 4: Generate Pencil.dev Operations

**Input:** Component specification

**Process:**
1. Convert YAML spec to Pencil batch_design operations
2. Create Insert operations for frames and text
3. Generate proper bindings for parent-child relationships
4. Add Update operations for nested properties

**Example:**
```javascript
// Pencil batch_design operations
card=I("parentId", {type: "frame", layout: "vertical", padding: 16, fill: "#FAFDFC", cornerRadius: 16})
title=I(card, {type: "text", content: "Professional", fontSize: 28, textAlign: "center"})
price=I(card, {type: "text", content: "$99", fontSize: 36, textColor: "#006A60"})
period=I(card, {type: "text", content: "/month", fontSize: 14, textColor: "#3F4946"})
features=I(card, {type: "frame", layout: "vertical", gap: 8})
feat1=I(features, {type: "text", content: "✓ Advanced analytics", fontSize: 14})
btn=I(card, {type: "ref", ref: "buttonComponentId"})
```

### Step 5: Output Production Code

**Input:** Component specification + Pencil operations

**Process:**
1. Generate HTML structure with semantic tags
2. Apply M3 Agency CSS classes
3. Include inline styles where needed
4. Add accessibility attributes (aria-labels, roles)
5. Ensure responsive behavior

**Example HTML:**
```html
<div class="card card-outlined pricing-card">
  <div class="pricing-name">Professional</div>
  <div class="pricing-price">$99</div>
  <div class="pricing-period">/month</div>
  <ul class="pricing-features">
    <li class="pricing-feature">Advanced analytics</li>
    <li class="pricing-feature">Priority support</li>
  </ul>
  <button class="btn btn-outlined">Choose Plan</button>
</div>
```

**Example CSS (M3 Agency):**
```css
/* Uses existing classes from m3-agency.css */
.pricing-card {
  padding: 16px;
  text-align: center;
  border-radius: 16px;
}

.pricing-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--md-sys-color-primary);
}
```

## Turbo Mode Optimization

This workflow is marked with `turbo: all` for maximum efficiency:

**Parallel Processing:**
- Load design tokens
- Parse user input
- Query Pencil style guides
- Generate multiple component variations

**Batch Operations:**
- Single batch_design call with all Insert/Update operations
- Minimize round-trips to MCP server
- Cache design tokens in memory

**Smart Caching:**
- Reuse loaded design system
- Cache component templates
- Store frequently used patterns

## Integration Points

### Pencil.dev MCP Tools

```bash
# Get design inspiration
mcp-cli call pencil/get_style_guide_tags '{}'
mcp-cli call pencil/get_style_guide '{"tags": ["website", "marketing", "modern"]}'

# Create component in .pen file
mcp-cli call pencil/batch_design '{
  "filePath": "designs/pricing-card.pen",
  "operations": "card=I(\"parent\", {type: \"frame\", ...})"
}'

# Validate output
mcp-cli call pencil/get_screenshot '{
  "filePath": "designs/pricing-card.pen",
  "nodeId": "card_id"
}'
```

### Design System Files

- **Tokens:** `.agent/designs/design-tokens.yaml`
- **Schema:** `.agent/designs/component-spec.schema.yaml`
- **Skill:** `.skills/pencil-design/SKILL.md`

## Error Handling

**Invalid Colors:**
```
Error: Color #FF5733 not in design system
Fix: Use primary (#006A60), secondary (#9C6800), or tertiary (#6750A4)
```

**Spacing Issues:**
```
Error: Padding value 15 not on 4px grid
Fix: Use 16 (nearest multiple of 4)
```

**Contrast Failures:**
```
Error: Text #BEC9C6 on #FAFDFC fails WCAG AA (ratio 2.1:1)
Fix: Use on_surface (#191C1B) for minimum 4.5:1 contrast
```

## Quality Checklist

Before outputting code, verify:

- [ ] All colors from design token palette
- [ ] Typography uses predefined scale
- [ ] Spacing follows 4px grid
- [ ] Corner radius from shape tokens
- [ ] Contrast ratio ≥ 4.5:1 for text
- [ ] Touch targets ≥ 44x44px
- [ ] Responsive breakpoints defined
- [ ] Accessibility attributes present
- [ ] Component hierarchy logical
- [ ] Code matches M3 Agency style

## Example Usage

**User Request:**
"Design a hero section with a gradient background, large title, subtitle, two CTA buttons, and 3 stat cards showing customer metrics"

**AI Response:**
```markdown
I'll create a hero section following the M3 Agency design system.

**Component Specification:**
[YAML spec here]

**Pencil.dev Operations:**
[batch_design operations]

**Production Code:**
[HTML/CSS implementation]

**Design Notes:**
- Gradient: surface → primary_container
- Title: display_large (57px)
- CTAs: filled (primary) + outlined variants
- Stats: Glass card effect with primary accent
- Mobile: Stack vertically, reduce title to 36px
```

## Best Practices

1. **Start with tokens** - Always reference design-tokens.yaml first
2. **Use component patterns** - Leverage existing M3 Agency components
3. **Think responsive** - Design mobile-first, enhance for desktop
4. **Validate visually** - Use get_screenshot to verify output
5. **Document choices** - Explain why specific tokens were selected

## Notes

- This workflow is optimized for rapid prototyping
- Output is production-ready and follows best practices
- Integrates seamlessly with existing M3 Agency codebase
- Supports both Pencil.dev .pen files and HTML/CSS generation
