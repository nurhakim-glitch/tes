const STORAGE_KEY = 'notulen_rapat_data';

const form = document.getElementById('minutes-form');
const formSection = document.getElementById('form-section');
const listSection = document.getElementById('list-section');
const detailSection = document.getElementById('detail-section');
const formTitle = document.getElementById('form-title');
const agendaList = document.getElementById('agenda-list');
const diskusiList = document.getElementById('diskusi-list');
const keputusanList = document.getElementById('keputusan-list');

function loadData() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function addAgenda(value = '') {
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.innerHTML = `
        <input type="text" class="agenda-input" placeholder="Agenda pembahasan..." value="${escapeHtml(value)}">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>
    `;
    agendaList.appendChild(row);
}

function addDiskusi(value = '') {
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.innerHTML = `
        <textarea class="diskusi-input" rows="2" placeholder="Poin pembahasan / diskusi...">${escapeHtml(value)}</textarea>
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>
    `;
    diskusiList.appendChild(row);
}

function addKeputusan(item = {}) {
    const row = document.createElement('div');
    row.className = 'keputusan-row';
    row.innerHTML = `
        <textarea class="k-isi" rows="2" placeholder="Keputusan / tindak lanjut...">${escapeHtml(item.isi || '')}</textarea>
        <input type="text" class="k-pic" placeholder="PIC" value="${escapeHtml(item.pic || '')}">
        <input type="date" class="k-deadline" value="${escapeHtml(item.deadline || '')}">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>
    `;
    keputusanList.appendChild(row);
}

window.addAgenda = addAgenda;
window.addDiskusi = addDiskusi;
window.addKeputusan = addKeputusan;

function clearDynamicLists() {
    agendaList.innerHTML = '';
    diskusiList.innerHTML = '';
    keputusanList.innerHTML = '';
}

function resetForm() {
    form.reset();
    document.getElementById('minutes-id').value = '';
    clearDynamicLists();
    addAgenda();
    addDiskusi();
    addKeputusan();
    formTitle.textContent = 'Buat Notulen Baru';
    document.getElementById('tanggal').value = new Date().toISOString().slice(0, 10);
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('minutes-id').value || uid();
    const agenda = Array.from(document.querySelectorAll('.agenda-input'))
        .map(el => el.value.trim())
        .filter(Boolean);
    const diskusi = Array.from(document.querySelectorAll('.diskusi-input'))
        .map(el => el.value.trim())
        .filter(Boolean);
    const keputusan = Array.from(document.querySelectorAll('.keputusan-row'))
        .map(row => ({
            isi: row.querySelector('.k-isi').value.trim(),
            pic: row.querySelector('.k-pic').value.trim(),
            deadline: row.querySelector('.k-deadline').value.trim()
        }))
        .filter(k => k.isi);

    const record = {
        id,
        judul: document.getElementById('judul').value.trim(),
        tanggal: document.getElementById('tanggal').value,
        waktu: document.getElementById('waktu').value,
        lokasi: document.getElementById('lokasi').value.trim(),
        pemimpin: document.getElementById('pemimpin').value.trim(),
        peserta: document.getElementById('peserta').value.trim(),
        agenda,
        diskusi,
        keputusan,
        catatan: document.getElementById('catatan').value.trim(),
        updatedAt: new Date().toISOString()
    };

    const data = loadData();
    const idx = data.findIndex(d => d.id === id);
    if (idx >= 0) {
        record.createdAt = data[idx].createdAt || record.updatedAt;
        data[idx] = record;
    } else {
        record.createdAt = record.updatedAt;
        data.unshift(record);
    }
    saveData(data);

    alert('✅ Notulen berhasil disimpan!');
    resetForm();
    showList();
});

document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Reset form? Data yang belum disimpan akan hilang.')) {
        resetForm();
    }
});

function showForm() {
    formSection.classList.remove('hidden');
    listSection.classList.add('hidden');
    detailSection.classList.add('hidden');
}

function showList() {
    renderList();
    formSection.classList.add('hidden');
    listSection.classList.remove('hidden');
    detailSection.classList.add('hidden');
}

function showDetail(id) {
    const data = loadData();
    const rec = data.find(d => d.id === id);
    if (!rec) return;
    renderDetail(rec);
    formSection.classList.add('hidden');
    listSection.classList.add('hidden');
    detailSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('toggle-list-btn').addEventListener('click', showList);
document.getElementById('back-to-form-btn').addEventListener('click', () => {
    resetForm();
    showForm();
});
document.getElementById('close-detail-btn').addEventListener('click', showList);
document.getElementById('print-btn').addEventListener('click', () => window.print());
document.getElementById('edit-btn').addEventListener('click', () => {
    const currentId = detailSection.dataset.currentId;
    if (currentId) editMinutes(currentId);
});

function renderList(filter = '') {
    const data = loadData();
    const container = document.getElementById('minutes-list');
    const q = filter.toLowerCase().trim();
    const filtered = q
        ? data.filter(d =>
            (d.judul || '').toLowerCase().includes(q) ||
            (d.pemimpin || '').toLowerCase().includes(q) ||
            (d.tanggal || '').includes(q))
        : data;

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state">
            <p>📭 Belum ada notulen tersimpan.</p>
            <p>Klik "+ Buat Baru" untuk mulai mencatat.</p>
        </div>`;
        return;
    }

    container.innerHTML = filtered.map(d => `
        <div class="minutes-item" onclick="showDetail('${d.id}')">
            <h3>${escapeHtml(d.judul)}</h3>
            <div class="meta">
                📅 ${formatDate(d.tanggal)} ${d.waktu ? '• ⏰ ' + escapeHtml(d.waktu) : ''}
                ${d.lokasi ? '• 📍 ' + escapeHtml(d.lokasi) : ''}
            </div>
            <div class="preview">👤 Pemimpin: ${escapeHtml(d.pemimpin || '-')}</div>
            <div class="actions" onclick="event.stopPropagation()">
                <button class="btn-primary" onclick="showDetail('${d.id}')">👁️ Lihat</button>
                <button class="btn-secondary" onclick="editMinutes('${d.id}')">✏️ Edit</button>
                <button class="btn-danger" onclick="deleteMinutes('${d.id}')">🗑️ Hapus</button>
            </div>
        </div>
    `).join('');
}

document.getElementById('search').addEventListener('input', (e) => {
    renderList(e.target.value);
});

function editMinutes(id) {
    const data = loadData();
    const rec = data.find(d => d.id === id);
    if (!rec) return;

    document.getElementById('minutes-id').value = rec.id;
    document.getElementById('judul').value = rec.judul || '';
    document.getElementById('tanggal').value = rec.tanggal || '';
    document.getElementById('waktu').value = rec.waktu || '';
    document.getElementById('lokasi').value = rec.lokasi || '';
    document.getElementById('pemimpin').value = rec.pemimpin || '';
    document.getElementById('peserta').value = rec.peserta || '';
    document.getElementById('catatan').value = rec.catatan || '';

    clearDynamicLists();
    (rec.agenda && rec.agenda.length ? rec.agenda : ['']).forEach(a => addAgenda(a));
    (rec.diskusi && rec.diskusi.length ? rec.diskusi : ['']).forEach(d => addDiskusi(d));
    (rec.keputusan && rec.keputusan.length ? rec.keputusan : [{}]).forEach(k => addKeputusan(k));

    formTitle.textContent = 'Edit Notulen';
    showForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteMinutes(id) {
    if (!confirm('Hapus notulen ini? Tindakan tidak dapat dibatalkan.')) return;
    const data = loadData().filter(d => d.id !== id);
    saveData(data);
    renderList(document.getElementById('search').value);
}

window.showDetail = showDetail;
window.editMinutes = editMinutes;
window.deleteMinutes = deleteMinutes;

function renderDetail(rec) {
    detailSection.dataset.currentId = rec.id;
    const content = document.getElementById('detail-content');

    const agendaHtml = (rec.agenda || []).length
        ? `<ol>${rec.agenda.map(a => `<li>${escapeHtml(a)}</li>`).join('')}</ol>`
        : '<p><em>Tidak ada agenda.</em></p>';

    const diskusiHtml = (rec.diskusi || []).length
        ? `<ol>${rec.diskusi.map(d => `<li>${escapeHtml(d).replace(/\n/g, '<br>')}</li>`).join('')}</ol>`
        : '<p><em>Tidak ada pembahasan.</em></p>';

    const keputusanHtml = (rec.keputusan || []).length
        ? `<table class="keputusan-table">
            <thead><tr><th>No</th><th>Keputusan / Tindak Lanjut</th><th>PIC</th><th>Deadline</th></tr></thead>
            <tbody>${rec.keputusan.map((k, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${escapeHtml(k.isi).replace(/\n/g, '<br>')}</td>
                    <td>${escapeHtml(k.pic || '-')}</td>
                    <td>${k.deadline ? formatDate(k.deadline) : '-'}</td>
                </tr>`).join('')}
            </tbody>
        </table>`
        : '<p><em>Tidak ada keputusan.</em></p>';

    const pesertaList = (rec.peserta || '').split(',').map(p => p.trim()).filter(Boolean);
    const pesertaHtml = pesertaList.length
        ? `<ul>${pesertaList.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`
        : '<p><em>Tidak ada peserta.</em></p>';

    content.innerHTML = `
        <h2>${escapeHtml(rec.judul)}</h2>
        <div class="detail-meta">
            <div><strong>Tanggal</strong>${formatDate(rec.tanggal)}</div>
            <div><strong>Waktu</strong>${escapeHtml(rec.waktu || '-')}</div>
            <div><strong>Lokasi</strong>${escapeHtml(rec.lokasi || '-')}</div>
            <div><strong>Pemimpin Rapat</strong>${escapeHtml(rec.pemimpin || '-')}</div>
        </div>

        <div class="detail-section">
            <h3>Peserta</h3>
            ${pesertaHtml}
        </div>

        <div class="detail-section">
            <h3>Agenda</h3>
            ${agendaHtml}
        </div>

        <div class="detail-section">
            <h3>Pembahasan</h3>
            ${diskusiHtml}
        </div>

        <div class="detail-section">
            <h3>Keputusan & Tindak Lanjut</h3>
            ${keputusanHtml}
        </div>

        ${rec.catatan ? `
        <div class="detail-section">
            <h3>Catatan Tambahan</h3>
            <p>${escapeHtml(rec.catatan).replace(/\n/g, '<br>')}</p>
        </div>` : ''}
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    resetForm();
});
