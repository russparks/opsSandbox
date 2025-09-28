const LEGEND_ITEMS = [
  { label: '0–30', color: '#2ecc71' },
  { label: '31–60', color: '#f1c40f' },
  { label: '61–90', color: '#e67e22' },
  { label: '90+', color: '#e74c3c' },
];

export function attachLegend(map: google.maps.Map): HTMLElement {
  const container = document.createElement('div');
  container.className = 'legend';
  container.innerHTML = `
    <strong>Drive time (mins)</strong>
    ${LEGEND_ITEMS.map(
      (item) => `
        <div><span class="swatch" style="background:${item.color}"></span> ${item.label}</div>
      `,
    ).join('')}
  `;

  map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(container);
  return container;
}
