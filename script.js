let currentLatLng = null;
let mapMarkersLayer = null;
let uploadedImageBase64 = ''; 

const defaultImage = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop";

// Lấy dữ liệu từ LocalStorage
let shops = JSON.parse(localStorage.getItem('trada_hanoi_shops_porsche'));
if (!shops || shops.length === 0) {
    shops = [
        { id: 1, name: "Trà Đá Nhà Thờ", address: "Hoàn Kiếm", lat: 21.0287, lng: 105.8488, price: "15K", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600" },
        { id: 2, name: "Vỉa Hè Cầu Giấy", address: "Cầu Giấy", lat: 21.0350, lng: 105.7950, price: "10K", image: "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?w=600" },
        { id: 3, name: "Góc Hồ Tây", address: "Tây Hồ", lat: 21.0580, lng: 105.8200, price: "20K", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600" }
    ];
    localStorage.setItem('trada_hanoi_shops_porsche', JSON.stringify(shops));
}

// Khởi tạo Bản đồ
const map = L.map('map', { zoomControl: false }).setView([21.0285, 105.8541], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
L.control.zoom({ position: 'bottomright' }).addTo(map);
mapMarkersLayer = L.layerGroup().addTo(map);

const teaIcon = L.divIcon({
    html: `<div style="font-size: 24px; filter: drop-shadow(0 0 5px rgba(255,0,0,0.5));">📍</div>`,
    className: 'bg-transparent border-none',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

// Render lưới ảnh và bản đồ
function renderApp() {
    const listContainer = document.getElementById('shop-list');
    listContainer.innerHTML = '';
    mapMarkersLayer.clearLayers();

    shops.forEach(shop => {
        const shopCard = document.createElement('div');
        shopCard.className = "relative h-64 md:h-72 lg:h-80 group cursor-pointer overflow-hidden bg-black";
        shopCard.innerHTML = `
            <img src="${shop.image || defaultImage}" class="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" alt="Shop">
            <div class="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-90"></div>
            
            <div class="absolute bottom-4 left-4 z-10">
                <div class="flex items-center gap-2">
                    <span class="text-red-600 font-bold">></span>
                    <h3 class="text-lg lg:text-xl font-light text-white tracking-wide">${shop.name}</h3>
                </div>
                <p class="text-xs text-gray-400 mt-1 pl-4 tracking-wider">${shop.price} | ${shop.address}</p>
            </div>
            
            <button onclick="deleteShop(${shop.id}, event)" class="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                Xóa
            </button>
        `;
        
        shopCard.onclick = () => map.flyTo([shop.lat, shop.lng], 16);
        listContainer.appendChild(shopCard);

        L.marker([shop.lat, shop.lng], { icon: teaIcon })
            .bindPopup(`
                <div class="font-sans font-light tracking-wide w-40">
                    <img src="${shop.image || defaultImage}" class="w-full h-24 object-cover mb-2 border border-gray-700">
                    <strong class="text-red-500">></strong> <span class="text-white">${shop.name}</span>
                    <p class="text-xs text-gray-400 mt-1">${shop.address}</p>
                </div>
            `)
            .addTo(mapMarkersLayer);
    });
}

// Xử lý chuyển đổi màn hình tính năng SPA
const navItems = document.querySelectorAll('.nav-item');
const screenViews = document.querySelectorAll('.screen-view');

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault(); 
        
        navItems.forEach(nav => {
            nav.classList.remove('text-white', 'border-b', 'border-red-600', 'pb-1');
            nav.classList.add('hover:text-white', 'transition');
        });
        this.classList.remove('hover:text-white', 'transition');
        this.classList.add('text-white', 'border-b', 'border-red-600', 'pb-1');
        
        screenViews.forEach(screen => {
            screen.classList.add('hidden');
            screen.classList.remove('flex');
            screen.classList.remove('z-10');
        });

        const targetId = this.getAttribute('data-target');
        const targetScreen = document.getElementById(targetId);
        
        if (targetId === 'screen-map') {
            targetScreen.classList.remove('hidden');
            targetScreen.classList.add('flex', 'z-10');
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        } else {
            targetScreen.classList.remove('hidden');
            targetScreen.classList.add('block', 'z-10');
        }
    });
});

// Xử lý File Upload sang Base64
document.getElementById('shop-image').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImageBase64 = event.target.result;
            const container = document.getElementById('image-preview-container');
            container.innerHTML = `<img src="${uploadedImageBase64}" class="w-full h-32 object-cover border border-gray-600">`;
        };
        reader.readAsDataURL(file); 
    }
});

// Tương tác Modal
const modal = document.getElementById('add-modal');
const form = document.getElementById('add-shop-form');

map.on('click', function(e) {
    currentLatLng = e.latlng;
    openModal();
});

function openModal() {
    modal.classList.remove('modal-hidden');
    modal.classList.add('modal-visible');
    document.getElementById('shop-name').focus();
    
    uploadedImageBase64 = '';
    document.getElementById('image-preview-container').innerHTML = `
        <span class="text-2xl mb-2 text-white">📸</span>
        <span class="text-gray-400 text-xs tracking-wide" id="image-label">Tải ảnh mặt tiền quán lên</span>
    `;
}

function closeModal() {
    modal.classList.remove('modal-visible');
    modal.classList.add('modal-hidden');
    form.reset();
}

// Submit
form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentLatLng) return;

    const newShop = {
        id: Date.now(),
        name: document.getElementById('shop-name').value,
        address: document.getElementById('shop-address').value,
        price: document.getElementById('shop-price').value,
        lat: currentLatLng.lat,
        lng: currentLatLng.lng,
        image: uploadedImageBase64 || defaultImage
    };

    shops.unshift(newShop);
    try {
        localStorage.setItem('trada_hanoi_shops_porsche', JSON.stringify(shops));
    } catch (e) {
        alert("Bộ nhớ đầy do dung lượng ảnh quá lớn. Hãy dùng ảnh dung lượng nhỏ hơn!");
        shops.shift(); 
        return;
    }
    
    closeModal();
    renderApp();
    map.flyTo([newShop.lat, newShop.lng], 16);
});

window.deleteShop = function(id, event) {
    event.stopPropagation();
    if(confirm("Xóa quán này khỏi danh sách?")) {
        shops = shops.filter(s => s.id !== id);
        localStorage.setItem('trada_hanoi_shops_porsche', JSON.stringify(shops));
        renderApp();
    }
}

renderApp();
