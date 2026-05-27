#!/usr/bin/env python3
"""
OlyRetail Dashboard — Home Page UI/UX Audit
============================================
Captures a live screenshot of the Home dashboard, reads its source code,
and sends both to Claude for a deep design review structured like a
senior product design director's audit.

Usage:
    python3 audit_home.py

Requirements:
    pip install anthropic rich playwright
    python3 -m playwright install chromium
"""

import asyncio
import base64
import os
import sys
import textwrap
from datetime import datetime
from pathlib import Path

import anthropic
from playwright.async_api import async_playwright
from rich.console import Console
from rich.panel import Panel
from rich.rule import Rule
from rich.text import Text
from rich import box

# ─── Config ──────────────────────────────────────────────────────────────────

DASHBOARD_URL   = "http://localhost:3000/dashboard"
SOURCE_FILE     = Path(__file__).parent / "app" / "dashboard" / "page.tsx"
SCREENSHOT_PATH = Path(__file__).parent / ".audit_screenshot.png"

# Viewport — match a typical 1440p enterprise laptop screen
VIEWPORT_WIDTH  = 1440
VIEWPORT_HEIGHT = 900

console = Console(width=120)

# ─── Screenshot capture ───────────────────────────────────────────────────────

async def capture_screenshot() -> bytes:
    """
    Launches a headless Chromium browser, navigates to the Home dashboard,
    waits for animations to settle, then captures a full-page screenshot.
    """
    console.print("[dim]→ Launching headless browser…[/dim]")
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page    = await browser.new_page(viewport={"width": VIEWPORT_WIDTH, "height": VIEWPORT_HEIGHT})

        await page.goto(DASHBOARD_URL, wait_until="networkidle", timeout=30_000)

        # Let animated numbers finish counting and any CSS transitions settle
        await asyncio.sleep(2.5)

        # Scroll to the very bottom so the full page is rendered, then back to top
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(0.5)
        await page.evaluate("window.scrollTo(0, 0)")
        await asyncio.sleep(0.3)

        # Full-page screenshot at 2× device pixel ratio for sharper detail
        png_bytes = await page.screenshot(full_page=True, scale="device")
        await browser.close()

    SCREENSHOT_PATH.write_bytes(png_bytes)
    console.print(f"[dim]→ Screenshot saved to {SCREENSHOT_PATH.name} ({len(png_bytes)//1024} KB)[/dim]")
    return png_bytes


# ─── Source code loader ───────────────────────────────────────────────────────

def load_source() -> str:
    """Read the Home page TSX source for structural analysis."""
    if not SOURCE_FILE.exists():
        console.print(f"[yellow]Warning: source file not found at {SOURCE_FILE}[/yellow]")
        return ""
    return SOURCE_FILE.read_text(encoding="utf-8")


# ─── Audit prompt ─────────────────────────────────────────────────────────────

SYSTEM_PROMPT = textwrap.dedent("""
    You are a principal product designer and design systems lead with 15+ years
    of experience shipping enterprise SaaS dashboards at companies like Figma,
    Linear, Vercel, Notion, and Stripe. You have a reputation for brutally honest,
    highly specific design feedback that turns mediocre dashboards into award-winning
    products.

    You are conducting a formal design audit of a retail analytics dashboard's
    Home page. You will receive:
      1. A full-page screenshot of the Home dashboard
      2. The complete React/TypeScript source code that renders it

    Your job is to analyse ONLY the Home page — not analytics, settings, or any
    other sections.

    AUDIT FRAMEWORK — evaluate every dimension below, in this exact order:

    ══════════════════════════════════════════════════════════════
    1. VISUAL HIERARCHY
    ══════════════════════════════════════════════════════════════
    - Spacing consistency (do gaps, padding, margins form a coherent scale?)
    - Typography hierarchy (size, weight, and colour contrast across heading levels)
    - Visual balance (left-right and top-bottom weight distribution)
    - Card hierarchy (do card sizes communicate importance correctly?)
    - Section emphasis (does the most important info draw the eye first?)
    - Alignment issues (pixel-level misalignments, ragged edges)
    - Whitespace usage (too tight? too loose? inconsistent?)
    - Readability (line-height, font-size, contrast on body text)
    - Contrast & accessibility (WCAG AA compliance on key text/background pairs)
    - Clutter / noise (unnecessary decorative elements, overuse of borders/badges)
    - Visual rhythm (does the eye flow naturally from section to section?)

    ══════════════════════════════════════════════════════════════
    2. LAYOUT & STRUCTURE
    ══════════════════════════════════════════════════════════════
    - Grid consistency (columns, gutters, breakpoints)
    - Equal-height card rows (do side-by-side cards have mismatched heights?)
    - Proportional balance (are column widths appropriate for content weight?)
    - Card arrangement (does the layout order match task/information priority?)
    - Modularity (can cards be rearranged without breaking the layout?)
    - Sectional flow (does the page tell a logical story top-to-bottom?)
    - Scanning behaviour (F-pattern / Z-pattern alignment for enterprise users)
    - Composition quality (overall layout sophistication vs. a basic grid dump)
    - Information architecture (are like things grouped together?)

    ══════════════════════════════════════════════════════════════
    3. DESIGN SYSTEM CONSISTENCY
    ══════════════════════════════════════════════════════════════
    - Colour consistency (is the palette applied systematically?)
    - Icon consistency (same icon library, same stroke width, same size grid?)
    - Corner radius consistency (mixed radii = visual inconsistency)
    - Padding consistency (do all cards use the same internal spacing?)
    - Component consistency (do similar things look the same?)
    - Visual language consistency (does every element feel from the same family?)
    - Interaction consistency (hover states, focus states — uniform?)

    ══════════════════════════════════════════════════════════════
    4. UX ANALYSIS
    ══════════════════════════════════════════════════════════════
    - Usability issues (anything confusing, hidden, or ambiguous)
    - Cognitive overload (too much information competing for attention)
    - Discoverability (can users find key actions without thinking?)
    - Scannability (can someone read the page in 5 seconds and understand state?)
    - Dashboard prioritisation (are the most critical metrics above the fold?)
    - Workflow clarity (does the page support real daily workflows?)
    - Content density (too sparse or too dense for the user's context?)
    - Interaction clarity (are clickable things obviously clickable?)

    ══════════════════════════════════════════════════════════════
    5. MODERN SAAS QUALITY CHECK
    ══════════════════════════════════════════════════════════════
    Identify anything that makes this dashboard feel:
    - AI-generated / cookie-cutter (generic patterns, predictable layouts)
    - Noisy or visually inflated (too many badges, labels, dividers, colours)
    - Outdated (UI patterns that feel 2018–2020 vintage)
    - Overdesigned (decorative complexity without functional benefit)
    - Underrefined (crude spacing, low-quality micro-details)

    Benchmark against: Linear, Vercel Dashboard, Stripe Dashboard, Retool,
    Grafana Cloud (2024 redesign), Figma's own UI.

    ══════════════════════════════════════════════════════════════
    OUTPUT FORMAT — follow this structure EXACTLY
    ══════════════════════════════════════════════════════════════

    Use this exact markdown structure so the Python script can parse and
    display it beautifully:

    ## EXECUTIVE SUMMARY
    3–5 sentence honest summary of the dashboard's current quality level,
    strongest areas, and most critical weaknesses.

    ## OVERALL SCORE
    Rate each dimension 1–10 with a one-line rationale:
    - Visual Hierarchy: X/10 — reason
    - Layout & Structure: X/10 — reason
    - Design System Consistency: X/10 — reason
    - UX Quality: X/10 — reason
    - Modern SaaS Quality: X/10 — reason
    - Overall: X/10

    ## FINDINGS

    For each finding use this format:
    ### [CATEGORY] Finding Title
    **Severity:** Critical | High | Medium | Low
    **What:** One sentence describing the issue.
    **Why it feels wrong:** The deeper visual/UX reason this degrades quality.
    **Fix:** Specific, actionable change to make.

    ## TOP 5 HIGHEST-IMPACT IMPROVEMENTS
    Ordered list of the 5 changes that would most improve perceived quality,
    each with a one-paragraph explanation.

    ## WHAT'S WORKING WELL
    Bullet list of genuine strengths — be specific, not generic.
""").strip()


USER_PROMPT = textwrap.dedent("""
    Please conduct a full design audit of this Home dashboard page.

    The screenshot shows the complete rendered Home page.
    The source code below is the React/TypeScript component that renders it.

    Be brutally honest. Identify every weakness, no matter how small.
    Explain the root cause of each visual quality issue — not just what is wrong
    but WHY it makes the dashboard feel less premium.

    SOURCE CODE:
    ---
    {source_code}
    ---
""").strip()


# ─── Claude API call ──────────────────────────────────────────────────────────

def run_audit(screenshot_bytes: bytes, source_code: str) -> str:
    """
    Sends the screenshot + source to Claude with the audit prompt
    and streams the response.
    """
    client  = anthropic.Anthropic()
    b64_img = base64.standard_b64encode(screenshot_bytes).decode("utf-8")

    console.print("[dim]→ Sending to Claude for analysis…[/dim]\n")

    full_response = []

    with client.messages.stream(
        model     = "claude-opus-4-7",         # Use the most capable model for deep analysis
        max_tokens= 8000,
        system    = SYSTEM_PROMPT,
        messages  = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type"      : "base64",
                            "media_type": "image/png",
                            "data"      : b64_img,
                        },
                    },
                    {
                        "type": "text",
                        "text": USER_PROMPT.format(source_code=source_code),
                    },
                ],
            }
        ],
    ) as stream:
        for text_chunk in stream.text_stream:
            full_response.append(text_chunk)

    return "".join(full_response)


# ─── Output renderer ──────────────────────────────────────────────────────────

def render_report(report: str) -> None:
    """Renders the markdown audit report into readable rich terminal output."""

    console.print()
    console.print(Rule(
        Text("  OlyRetail Dashboard — Home Page Design Audit  ", style="bold white"),
        style="bright_magenta",
    ))
    console.print(Text(
        f"  Generated {datetime.now().strftime('%d %b %Y, %H:%M')}  ·  "
        f"Viewport {VIEWPORT_WIDTH}×{VIEWPORT_HEIGHT}  ·  Model: claude-opus-4-7",
        style="dim",
        justify="center",
    ))
    console.print()

    # Split by H2/H3 headings and render each block
    current_section = []
    section_title   = ""

    SECTION_STYLES = {
        "EXECUTIVE SUMMARY"              : ("bright_cyan",    "bold bright_cyan"),
        "OVERALL SCORE"                  : ("bright_yellow",  "bold bright_yellow"),
        "FINDINGS"                       : ("bright_red",     "bold bright_red"),
        "TOP 5 HIGHEST-IMPACT"           : ("bright_green",   "bold bright_green"),
        "WHAT'S WORKING WELL"            : ("bright_blue",    "bold bright_blue"),
    }

    def flush_section(title: str, lines: list[str]) -> None:
        if not lines:
            return
        body = "\n".join(lines).strip()
        if not body:
            return

        # Pick style based on keyword match
        border_style, title_style = "white", "bold white"
        for keyword, styles in SECTION_STYLES.items():
            if keyword in title.upper():
                border_style, title_style = styles
                break

        console.print(Panel(
            body,
            title       = Text(f"  {title}  ", style=title_style),
            title_align = "left",
            border_style= border_style,
            box         = box.ROUNDED,
            padding      = (1, 2),
        ))
        console.print()

    # Walk through lines and group by H2 section
    for line in report.splitlines():
        if line.startswith("## "):
            flush_section(section_title, current_section)
            section_title   = line[3:].strip()
            current_section = []
        else:
            current_section.append(line)

    flush_section(section_title, current_section)   # flush final section

    # Save raw report to file
    report_path = Path(__file__).parent / "audit_report.md"
    report_path.write_text(
        f"# OlyRetail Home Dashboard — Design Audit\n"
        f"_{datetime.now().strftime('%d %B %Y, %H:%M')}_\n\n"
        + report,
        encoding="utf-8",
    )
    console.print(Rule(style="dim"))
    console.print(f"[dim]Full report saved → [bold]{report_path.name}[/bold][/dim]")
    console.print()


# ─── Entrypoint ───────────────────────────────────────────────────────────────

async def main() -> None:
    console.print()
    console.print(Panel(
        "[bold]OlyRetail · Home Dashboard · Design Audit[/bold]\n"
        "[dim]Captures a live screenshot, reads source code, "
        "and runs a deep AI-powered UX review.[/dim]",
        border_style="bright_magenta",
        box=box.ROUNDED,
        padding=(0, 2),
    ))
    console.print()

    # 1. Check dev server is running
    import urllib.request
    try:
        urllib.request.urlopen(DASHBOARD_URL, timeout=5)
    except Exception:
        console.print(
            "[bold red]Error:[/bold red] Cannot reach the dev server at "
            f"[bold]{DASHBOARD_URL}[/bold]\n"
            "Run [bold]npm run dev[/bold] first, then retry."
        )
        sys.exit(1)

    # 2. Capture screenshot
    console.print("[bold]Step 1 / 3[/bold]  Capturing live screenshot…")
    screenshot_bytes = await capture_screenshot()

    # 3. Load source code
    console.print("[bold]Step 2 / 3[/bold]  Loading source code…")
    source_code = load_source()
    if source_code:
        line_count = source_code.count("\n")
        console.print(f"[dim]→ Loaded {line_count} lines from {SOURCE_FILE.name}[/dim]")
    else:
        console.print("[yellow]Warning: No source code loaded — visual-only analysis.[/yellow]")

    # 4. Run audit
    console.print("[bold]Step 3 / 3[/bold]  Running design audit…\n")
    report = run_audit(screenshot_bytes, source_code)

    # 5. Render
    render_report(report)


if __name__ == "__main__":
    # Ensure ANTHROPIC_API_KEY is set
    if not os.environ.get("ANTHROPIC_API_KEY"):
        Console().print(
            "[bold red]Error:[/bold red] ANTHROPIC_API_KEY environment variable is not set.\n"
            "Export it first:  [bold]export ANTHROPIC_API_KEY='sk-ant-...'[/bold]"
        )
        sys.exit(1)

    asyncio.run(main())
