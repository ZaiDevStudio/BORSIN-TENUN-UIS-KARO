// Register Service Worker (PWA)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('#').catch(e => console.log(e));
}

// Hamburger Logic
function toggleMenu() {
    const nav = document.getElementById('navLinks');
    nav.classList.toggle('active');
}

// Helper: Convert Image File to Base64
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

// Helper: Format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(number);
};

// --- DATA MANAGEMENT (LocalStorage) ---

// Karyawan Logic
function simpanKaryawan() {
    const nama = document.getElementById('nama').value;
    const hp = document.getElementById('hp').value;
    const rek = document.getElementById('rek').value;

    if(!nama) return alert("Nama wajib diisi!");

    const karyawan = JSON.parse(localStorage.getItem('db_karyawan')) || [];
    karyawan.push({ id: Date.now(), nama, hp, rek });
    localStorage.setItem('db_karyawan', JSON.stringify(karyawan));
    
    alert('Data Karyawan Tersimpan!');
    window.location.href = 'karyawan.html';
}

function loadKaryawan() {
    const list = document.getElementById('karyawanList');
    const data = JSON.parse(localStorage.getItem('db_karyawan')) || [];
    
    let html = '';
    if(data.length === 0) html = '<p>Belum ada data karyawan.</p>';
    
    data.forEach(k => {
        html += `
        <div class="card">
            <h3>${k.nama}</h3>
            <p><strong>HP:</strong> ${k.hp}</p>
            <p><strong>Rek:</strong> ${k.rek}</p>
            <div class="btn-action-group">
                <button class="btn btn-danger btn-small" onclick="hapusKaryawan(${k.id})">Hapus</button>
            </div>
        </div>`;
    });
    list.innerHTML = html;
}

function hapusKaryawan(id) {
    if(!confirm("Hapus data ini?")) return;
    let data = JSON.parse(localStorage.getItem('db_karyawan')) || [];
    data = data.filter(item => item.id !== id);
    localStorage.setItem('db_karyawan', JSON.stringify(data));
    loadKaryawan();
}

function hapusSemuaKaryawan() {
    if(!confirm("Hapus SEMUA data karyawan?")) return;
    localStorage.removeItem('db_karyawan');
    loadKaryawan();
}

// Ulos Logic
async function simpanUlos() {
    const nama = document.getElementById('namaUlos').value;
    const upah = parseFloat(document.getElementById('upah').value) || 0;
    const pakan = parseFloat(document.getElementById('pakan').value) || 0;
    const jual = parseFloat(document.getElementById('jual').value) || 0;
    const warna = document.getElementById('warna').value;
    
    const imgFile = document.getElementById('gambarUlos').files[0];
    const motifFile = document.getElementById('rumusMotif').files[0];

    let imgBase64 = '';
    let motifBase64 = '';

    if(imgFile) imgBase64 = await toBase64(imgFile);
    if(motifFile) motifBase64 = await toBase64(motifFile);

    const ulos = JSON.parse(localStorage.getItem('db_ulos')) || [];
    ulos.push({ 
        id: Date.now(), 
        nama, upah, pakan, jual, warna, 
        img: imgBase64, 
        motif: motifBase64 
    });
    
    localStorage.setItem('db_ulos', JSON.stringify(ulos));
    alert('Data Ulos Tersimpan!');
    window.location.href = 'ulos.html';
}

function loadUlos() {
    const list = document.getElementById('ulosList');
    const search = document.getElementById('searchUlos').value.toLowerCase();
    const data = JSON.parse(localStorage.getItem('db_ulos')) || [];
    
    let html = '';
    const filtered = data.filter(item => item.nama.toLowerCase().includes(search));

    filtered.forEach(u => {
        html += `
        <div class="card">
            <img src="${u.img || 'https://via.placeholder.com/150?text=No+Image'}" alt="Ulos">
            <h3>${u.nama}</h3>
            <p>Warna: ${u.warna}</p>
            <p>Upah: ${formatRupiah(u.upah)}</p>
            <p>Pakan: ${formatRupiah(u.pakan)}</p>
            <p>Jual: ${formatRupiah(u.jual)}</p>
            <div class="btn-action-group">
                ${u.img ? `<a href="${u.img}" download="ulos_${u.nama}.png" class="btn btn-primary btn-small">Unduh Foto</a>` : ''}
                <button class="btn btn-danger btn-small" onclick="hapusUlos(${u.id})">Hapus</button>
            </div>
        </div>`;
    });
    list.innerHTML = html;
}

function hapusUlos(id) {
    if(!confirm("Hapus ulos ini?")) return;
    let data = JSON.parse(localStorage.getItem('db_ulos')) || [];
    data = data.filter(item => item.id !== id);
    localStorage.setItem('db_ulos', JSON.stringify(data));
    loadUlos();
}

// Hitung Gaji Logic
function initHitungGaji() {
    const selNama = document.getElementById('pilihNama');
    const selUlos = document.getElementById('pilihUlos');
    
    const empData = JSON.parse(localStorage.getItem('db_karyawan')) || [];
    const ulosData = JSON.parse(localStorage.getItem('db_ulos')) || [];

    empData.forEach(k => {
        let opt = document.createElement('option');
        opt.value = k.nama;
        opt.innerText = k.nama;
        selNama.appendChild(opt);
    });

    ulosData.forEach(u => {
        let opt = document.createElement('option');
        opt.value = u.id; // Use ID for lookup
        opt.innerText = u.nama;
        selUlos.appendChild(opt);
    });
}

function autoFillUlos() {
    const id = document.getElementById('pilihUlos').value;
    const ulosData = JSON.parse(localStorage.getItem('db_ulos')) || [];
    const selected = ulosData.find(u => u.id == id);
    
    if(selected) {
        document.getElementById('displayUpah').value = selected.upah;
        document.getElementById('hiddenPakanSatuan').value = selected.pakan;
        hitungLive();
    }
}

function hitungLive() {
    const qty = parseFloat(document.getElementById('jumlahUlos').value) || 0;
    const upah = parseFloat(document.getElementById('displayUpah').value) || 0;
    const pakanSatuan = parseFloat(document.getElementById('hiddenPakanSatuan').value) || 0;
    
    const totalPakan = qty * pakanSatuan;
    document.getElementById('biayaPakanTotal').value = totalPakan;

    // Get deductions
    const pot1 = parseFloat(document.getElementById('pot_listrik').value) || 0;
    const pot2 = parseFloat(document.getElementById('pot_wifi').value) || 0;
    const pot3 = parseFloat(document.getElementById('pot_alat').value) || 0;
    const pot4 = parseFloat(document.getElementById('pot_lain').value) || 0;
    const totalPot = pot1 + pot2 + pot3 + pot4;

    const kotor = qty * upah;
    const bersih = kotor - totalPakan - totalPot;

    document.getElementById('gajiBersih').innerText = formatRupiah(bersih);
}

function simpanGaji() {
    const nama = document.getElementById('pilihNama').value;
    if(!nama) return alert("Pilih Nama Karyawan!");

    const ulosId = document.getElementById('pilihUlos').value;
    const ulosData = JSON.parse(localStorage.getItem('db_ulos')) || [];
    const ulos = ulosData.find(u => u.id == ulosId) || {nama: 'Unknown'};

    const qty = parseFloat(document.getElementById('jumlahUlos').value) || 0;
    const upah = parseFloat(document.getElementById('displayUpah').value) || 0;
    const totalPakan = parseFloat(document.getElementById('biayaPakanTotal').value) || 0;
    
    const pot1 = parseFloat(document.getElementById('pot_listrik').value) || 0;
    const pot2 = parseFloat(document.getElementById('pot_wifi').value) || 0;
    const pot3 = parseFloat(document.getElementById('pot_alat').value) || 0;
    const pot4 = parseFloat(document.getElementById('pot_lain').value) || 0;
    const totalPot = pot1 + pot2 + pot3 + pot4;

    const gajiBersih = (qty * upah) - totalPakan - totalPot;

    const dataGaji = JSON.parse(localStorage.getItem('db_gaji')) || [];
    dataGaji.push({
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        nama,
        namaUlos: ulos.nama,
        qty,
        totalPakan,
        totalPot,
        gajiBersih
    });

    localStorage.setItem('db_gaji', JSON.stringify(dataGaji));
    alert("Gaji berhasil dihitung dan disimpan!");
    window.location.href = 'gaji.html';
}

// Rekapan Gaji Logic
function loadRekapanGaji() {
    const tbody = document.getElementById('tabelGajiBody');
    const data = JSON.parse(localStorage.getItem('db_gaji')) || [];

    let html = '';
    let totUlos = 0, totPakan = 0, totPot = 0, totGaji = 0;

    data.forEach((g, index) => {
        totUlos += g.qty;
        totPakan += g.totalPakan;
        totPot += g.totalPot;
        totGaji += g.gajiBersih;

        html += `
        <tr>
            <td>${index + 1}</td>
            <td>${g.date}</td>
            <td>${g.nama}</td>
            <td>${g.namaUlos}</td>
            <td>${g.qty}</td>
            <td>${formatRupiah(g.totalPakan)}</td>
            <td>${formatRupiah(g.totalPot)}</td>
            <td>${formatRupiah(g.gajiBersih)}</td>
            <td>
                <button class="btn-danger btn-small" onclick="hapusGaji(${g.id})">X</button>
            </td>
        </tr>`;
    });

    tbody.innerHTML = html;
    
    document.getElementById('totUlos').innerText = totUlos;
    document.getElementById('totPakan').innerText = formatRupiah(totPakan);
    document.getElementById('totPot').innerText = formatRupiah(totPot);
    document.getElementById('totGaji').innerText = formatRupiah(totGaji);
}

function hapusGaji(id) {
    if(!confirm("Hapus data gaji ini?")) return;
    let data = JSON.parse(localStorage.getItem('db_gaji')) || [];
    data = data.filter(item => item.id !== id);
    localStorage.setItem('db_gaji', JSON.stringify(data));
    loadRekapanGaji();
}

function hapusSemuaGaji() {
    if(!confirm("Yakin hapus SEMUA data gaji?")) return;
    localStorage.removeItem('db_gaji');
    loadRekapanGaji();
}

// Slip Gaji Logic
function loadSlipGaji() {
    const container = document.getElementById('slipContainer');
    const data = JSON.parse(localStorage.getItem('db_gaji')) || [];
    
    // Show only the latest by default or loop all? Assuming latest for single slip view or list.
    // Let's list simple slips that can be expanded.
    
    let html = '';
    if(data.length === 0) html = '<p>Belum ada data gaji.</p>';

    // Sort by newest
    data.reverse().forEach(g => {
        html += `
        <div class="card" id="slip-${g.id}" style="margin-bottom:20px; background:#fffdf0; border:2px dashed var(--primary-green);">
            <div style="text-align:center; margin-bottom:10px;">
                <img src="borsin.png" style="width:50px; height:50px; border:none;">
                <h3>BORSIN TENUN</h3>
                <p>Slip Gaji Karyawan</p>
            </div>
            <hr>
            <table style="width:100%; border:none;">
                <tr><td>Nama</td><td>: ${g.nama}</td></tr>
                <tr><td>Tanggal</td><td>: ${g.date}</td></tr>
                <tr><td>Ulos</td><td>: ${g.namaUlos} (${g.qty} lbr)</td></tr>
                <tr><td>Potongan</td><td>: ${formatRupiah(g.totalPot)}</td></tr>
                <tr><td colspan="2"><hr></td></tr>
                <tr><td><strong>Total Terima</strong></td><td><strong>: ${formatRupiah(g.gajiBersih)}</strong></td></tr>
            </table>
            <div class="qr-placeholder" id="qr-${g.id}"></div>
            <button class="btn btn-primary" onclick="downloadSlip('slip-${g.id}')">Unduh Gambar</button>
            <button class="btn" onclick="copyText('${g.gajiBersih}')">Salin Nominal</button>
        </div>`;
        
        // QR Generation (Simulated delay for DOM)
        setTimeout(() => {
            // Using a simple QR API for demo or placeholder text if library missing
            // In production, use qrcode.js library
            const qrDiv = document.getElementById(`qr-${g.id}`);
            qrDiv.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${g.gajiBersih}" alt="QR Bayar">`;
        }, 100);
    });
    container.innerHTML = html;
}

function downloadSlip(elementId) {
    const element = document.getElementById(elementId);
    html2canvas(element).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Slip_Gaji.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

function copyText(text) {
    navigator.clipboard.writeText(text);
    alert("Nominal disalin: " + text);
}
