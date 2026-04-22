const CONFIG = {
  SEARCH_URL: 'https://www.oemvwshop.fr/chercher/?q=',
  HIDE_SELECTORS: '.adsbygoogle, #google_esf, .time1Over, #ModalСnt, .modal-backdrop',
  SPAN_SELECTOR: 'td.etkTd[num] > span.monoSpace:not([data-etk-link])',
  BASKET_SELECTOR: '.adInfoBasket[onclick]:not([data-etk-link])',
  REMARK_ROW_SELECTOR: 'tr:not([data-etk-processed])',
}

const remarks = {
  "07L103707A": "Includes 7.65x1.78mm FPM 75-shore o-ring",
  "07L115009AD": {
    label: "Rebuild",
    link: "https://github.com/dekefake/superetka-enriched/blob/master/doc/07L115009AD.md",
  },
}

// These references are known to be out of stock, so we can directly link alternatives here
const outOfStockRefs = {
  "07L103483K": "https://www.auto-doc.fr/search?keyword=07L103483K",
}

const forceHide = el => {
  el.style.setProperty('display', 'none', 'important')
  el.style.setProperty('opacity', '0', 'important')
  el.style.setProperty('pointer-events', 'none', 'important')
  el.style.setProperty('position', 'absolute', 'important')
  el.style.setProperty('left', '-9999px', 'important')
  document.body.style.setProperty('padding', '0', 'important')
}

// Initial hide of unwanted elements through CSS stylesheet injection
const style = document.createElement('style')
style.textContent = `${CONFIG.HIDE_SELECTORS} {
  display: none !important;
  opacity: 0 !important;
  pointer-events: none !important;
  position: absolute !important;
  left: -9999px !important;
}`
setTimeout(() => {
  document.body.appendChild(style)
  document.body.addEventListener('click', () => {
    processNodes()
  })
}, 5000)

// Periodically hide items in case they pop again
setInterval(() => {
  document.querySelectorAll?.(CONFIG.HIDE_SELECTORS).forEach(forceHide)
}, 1000)

function processNodes(scope = document) {
  console.log('Processing nodes in scope', new Date())
  document.querySelectorAll?.(CONFIG.HIDE_SELECTORS).forEach(forceHide)

  // 1. Enrich VAG remarks
  const rows = (scope.querySelectorAll ? scope : document).querySelectorAll(CONFIG.REMARK_ROW_SELECTOR)
  rows.forEach(row => {
    // Find the cell containing the "num" attribute (usually the 5th cell)
    const refCell = row.querySelector('td[num]')
    if (!refCell) return

    const ref = refCell.getAttribute('num')
    const remarkValue = remarks[ref]

    if (remarkValue) {
      const cells = row.querySelectorAll('td')
      // Ensure there are at least 7 cells before trying to fill the 7th one (index 6)
      if (cells.length >= 7) {
        if (typeof remarkValue === 'object' && remarkValue.link) {
          const link = document.createElement('a')
          link.href = remarkValue.link
          link.textContent = remarkValue.label || 'More info'
          link.target = '_blank'
          link.style.color = 'darkgreen' // Make it stand out as enriched info
          link.rel = 'noopener noreferrer'
          cells[6].textContent = '' // Clear existing content
          cells[6].appendChild(link)
        } else {
          cells[6].textContent = remarkValue
        }
        cells[6].style.fontWeight = 'bold'
        cells[6].style.color = 'darkgreen' // Make it stand out as enriched info
        row.dataset.etkProcessed = '1' // Mark as processed to avoid redundant loops
      }
    }
  })

  // 2. Convert VAG Reference Spans to Links
  scope.querySelectorAll?.(CONFIG.SPAN_SELECTOR).forEach(span => {
    const ref = span.textContent?.trim().replace(/\s+/g, '')
    if (!ref) return

    const outOfStockLink = outOfStockRefs[ref]
    const link = document.createElement('a')
    link.href = outOfStockLink || `${CONFIG.SEARCH_URL}${encodeURIComponent(ref)}`
    link.textContent = span.textContent // Keep original formatting
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    if (outOfStockLink) link.style.color = 'red' // Highlight known out-of-stock items
    link.dataset.etkLink = '1'

    span.replaceWith(link)
  })

  // 3. Convert Basket Buttons to Links
  scope.querySelectorAll?.(CONFIG.BASKET_SELECTOR).forEach(btn => {
    const ref = btn.getAttribute('onclick')?.match(/basketAddItem\((?:&quot|")([^"&]+)/)?.[1] || null
    if (!ref) return

    btn.dataset.etkLink = '1'
    btn.style.cursor = 'pointer'
    btn.removeAttribute('onclick')
    const outOfStockLink = outOfStockRefs[ref]
    if (outOfStockLink) btn.style.setProperty('background-color', 'red', 'important') // Highlight known out-of-stock items
    btn.onclick = (e) => {
      e.preventDefault()
      window.open(outOfStockLink || `${CONFIG.SEARCH_URL}${encodeURIComponent(ref)}`, '_blank', 'noopener,noreferrer')
    }
  })
}

processNodes()

const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) processNodes(node)
    })
    if (mutation.type === 'attributes' && mutation.target.nodeType === 1) processNodes(mutation.target)
  })
})

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['onclick'],
})