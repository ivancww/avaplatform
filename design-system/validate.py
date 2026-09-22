"""Design System checks. Requires tinycss2, Playwright and installed browsers.

Run from any directory. Artifacts go to /tmp/ava-design-system-qa by default.
This checks presentation specimens, not production business flows.
"""
import argparse
import json
from itertools import permutations
import re
from pathlib import Path

import tinycss2
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent


def static_checks():
    sources = {p.name: p.read_text() for p in ROOT.glob('*.css')}
    defined = set(re.findall(r'(--ava-[\w-]+)\s*:', sources['tokens.css']))
    # Visualization data is the only consumer-supplied CSS variable.
    used = set(re.findall(r'var\((--ava-[\w-]+)', '\n'.join(sources.values())))
    assert used - defined == {'--ava-visual-value'}, used - defined

    def inspect(rules):
        for rule in rules:
            assert rule.type != 'error', rule
            if rule.type == 'at-rule' and rule.content:
                inspect(tinycss2.parse_rule_list(rule.content, skip_comments=True, skip_whitespace=True))
            elif rule.type == 'qualified-rule':
                for declaration in tinycss2.parse_declaration_list(rule.content, skip_comments=True, skip_whitespace=True):
                    assert declaration.type != 'error', declaration

    for name, source in sources.items():
        inspect(tinycss2.parse_stylesheet(source, skip_comments=True, skip_whitespace=True))
        if name != 'tokens.css':
            assert not re.search(r'#[\da-fA-F]{3,8}\b|rgba?\(', source), name
        boundaries = re.findall(r'(?:min|max)-width:\s*(\d+)px', source)
        assert set(boundaries) <= {'650', '651', '1000', '1001'}, (name, boundaries)
    # Detect circular token aliases.
    values = dict(re.findall(r'(--ava-[\w-]+):\s*([^;]+);', sources['tokens.css']))
    def visit(name, stack):
        assert name not in stack, stack + [name]
        for child in re.findall(r'var\((--ava-[\w-]+)', values.get(name, '')):
            visit(child, stack + [name])
    for name in values:
        visit(name, [])
    print('PASS: CSS parsing, variable references, alias cycles, centralized colors and responsive boundaries')


def browser_checks(engine, artifacts):
    with sync_playwright() as playwright:
        browser = getattr(playwright, engine).launch()
        context = browser.new_context(has_touch=True, device_scale_factor=1)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.on('console', lambda message: errors.append(message.text) if message.type == 'error' else None)
        cases = [(320, 740), (390, 844), (650, 900), (651, 900), (768, 1024),
                 (820, 1180), (1000, 900), (1001, 900), (1024, 768), (1180, 820), (1440, 1000)]
        for width, height in cases:
            page.set_viewport_size({'width': width, 'height': height})
            page.goto((ROOT / 'preview.html').as_uri())
            page.evaluate('document.fonts.ready')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, 'overflow')
            columns = page.locator('.ava-grid--modules').evaluate('(el) => getComputedStyle(el).gridTemplateColumns.split(" ").length')
            assert columns == (1 if width <= 650 else 2 if width <= 1000 else 4), (width, columns)
            controls = page.locator('button:visible, input:visible, select:visible, .ava-nav__item:visible')
            for control in controls.all():
                assert control.bounding_box()['height'] >= 44, (width, control.inner_text())
            page.locator('#name').fill('AVA Agent 測試')
            assert page.locator('#name').input_value() == 'AVA Agent 測試'
            assert page.locator('[data-ava-mode="use"] .ava-edit-only').is_hidden()
            assert page.locator('[data-ava-mode="preview"] .ava-edit-only').is_hidden()
            assert page.locator('[data-ava-mode="presentation"] .ava-agent-only').is_hidden()
            assert page.get_by_role('button', name='Exit presentation').is_visible()
            page.locator('#primary').focus()
            assert page.locator('#primary').evaluate('(el) => getComputedStyle(el).outlineStyle') != 'none'
            page.keyboard.press('Tab')
            assert page.evaluate('document.activeElement.textContent') == 'Back'
            if width in (390, 768, 1024):
                page.screenshot(path=str(artifacts / f'{engine}-{width}.png'), full_page=True)
        # Disabled selection wins over the selected background; focus is not clipped.
        selected = page.locator('.ava-card--interactive[aria-pressed="true"]')
        selected.evaluate('(el) => el.disabled = true')
        assert selected.evaluate('(el) => getComputedStyle(el).backgroundColor') == 'rgb(226, 232, 240)'
        page.set_viewport_size({'width': 390, 'height': 400})
        page.locator('#modal-specimen').evaluate('(el) => el.hidden = false')
        modal = page.locator('.ava-modal')
        box = modal.bounding_box()
        assert box['y'] >= 0 and box['y'] + box['height'] <= 400
        assert modal.evaluate('(el) => el.scrollHeight > el.clientHeight')
        page.locator('#modal-specimen').evaluate('(el) => el.hidden = true')
        page.evaluate('document.documentElement.style.fontSize = "200%"')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth'), '200% text overflow'
        page.emulate_media(reduced_motion='reduce')
        assert page.locator('.ava-front__progress-fill').evaluate('(el) => getComputedStyle(el).transitionDuration') == '0s'
        assert not errors, errors
        # Desktop pointer states are separately checked from touch viewports.
        desktop = browser.new_page(viewport={'width': 1440, 'height': 1000})
        desktop.goto((ROOT / 'preview.html').as_uri())
        button = desktop.locator('#primary')
        button.hover()
        assert button.evaluate('(el) => getComputedStyle(el).backgroundColor') == 'rgb(23, 47, 112)'
        desktop.mouse.down()
        assert button.evaluate('(el) => getComputedStyle(el).backgroundColor') == 'rgb(219, 234, 254)'
        desktop.mouse.up()
        # G2: simulate asymmetric device insets without claiming hardware emulation.
        safe_selectors = ['.ava-header', '.ava-front__header', '.ava-management__header',
                          '.ava-container', '.ava-management__workspace', '.ava-modal-backdrop']
        for width, height in cases:
            desktop.set_viewport_size({'width': width, 'height': height})
            for left, right in [(0, 0), (59, 24), (24, 59)]:
                desktop.evaluate("""([left, right]) => {
                    document.documentElement.style.setProperty('--ava-safe-area-left', left + 'px');
                    document.documentElement.style.setProperty('--ava-safe-area-right', right + 'px');
                    document.querySelector('#modal-specimen').hidden = false;
                }""", [left, right])
                for selector in safe_selectors:
                    padding = desktop.locator(selector).first.evaluate("""el => {
                        const style = getComputedStyle(el);
                        return [parseFloat(style.paddingLeft), parseFloat(style.paddingRight),
                                parseFloat(style.getPropertyValue('--ava-page-padding-inline'))];
                    }""")
                    assert padding[:2] == [max(left, padding[2]), max(right, padding[2])], (selector, width, padding)
                modal_box = desktop.locator('.ava-modal').bounding_box()
                assert modal_box['x'] >= left and modal_box['x'] + modal_box['width'] <= width - right
                assert desktop.evaluate('document.documentElement.scrollWidth <= innerWidth')
        # G3: semantic statuses win in every ordering of the three shared stylesheets.
        for order in permutations(['components.css', 'frontend.css', 'management.css']):
            desktop.evaluate("""order => {
                for (const name of order) {
                    document.head.append(document.querySelector(`link[href="${name}"]`));
                }
            }""", list(order))
            status = desktop.locator('.ava-management__status')
            for state, token in [('success', '--ava-color-success-text'),
                                 ('warning', '--ava-color-warning'), ('error', '--ava-color-error')]:
                colors = status.evaluate("""(el, [state, token]) => {
                    el.className = 'ava-management__status ava-status--' + state;
                    const actual = getComputedStyle(el).color;
                    el.style.color = `var(${token})`;
                    const expected = getComputedStyle(el).color;
                    el.style.removeProperty('color');
                    return [actual, expected];
                }""", [state, token])
                assert colors[0] == colors[1], (order, state, colors)
        browser.close()
        report = {'engine': engine, 'viewports': cases, 'status': 'PASS',
                  'checks': ['overflow', 'grid adaptation', '44px targets', 'input', 'keyboard focus',
                             'modes', 'disabled selection', 'short modal', '200% text', 'reduced motion',
                             'hover', 'pressed', 'console', 'asymmetric safe areas',
                             'semantic status priority in all six stylesheet orders'],
                  'limitation': 'Browser emulation, not physical iPad Safari or full application QA'}
        (artifacts / f'{engine}-results.json').write_text(json.dumps(report, indent=2) + '\n')
        print(f'PASS: {engine}, {len(cases)} responsive viewports and interaction checks')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--browser', choices=['chromium', 'webkit'], default='chromium')
    parser.add_argument('--static-only', action='store_true')
    parser.add_argument('--artifacts', type=Path, default=Path('/tmp/ava-design-system-qa'))
    args = parser.parse_args()
    static_checks()
    if not args.static_only:
        args.artifacts.mkdir(parents=True, exist_ok=True)
        browser_checks(args.browser, args.artifacts)
