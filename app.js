// 全局变量
let categories = ['水果', '买菜', '餐饮', '交通', '日用品'];
let subcategories = {}; // 格式: {category: [子分类1, 子分类2...]}
let accountingRecords = []; // 记账记录
let reserveRecords = []; // 备用金记录

// 全局变量，用于存储余额日期范围
let balanceDateRange = {
    start: null,
    end: null
};

// 图表变量
let expenseChart = null;
let trendChart = null;

// 日期范围变量
let dashboardDateRange = {
    start: null,
    end: null
};

// DOM 加载完成后执行初始化
document.addEventListener('DOMContentLoaded', function() {
    // 确保日期选择器已加载
    if (typeof flatpickr === 'undefined' && typeof simpleDatePicker === 'undefined') {
        alert('日期选择器库未加载，请刷新页面重试');
        console.error('日期选择器库未加载');
        return;
    }
    
    // 设置全局别名，确保兼容性
    if (typeof flatpickr === 'undefined' && typeof simpleDatePicker !== 'undefined') {
        window.flatpickr = window.simpleDatePicker;
    }
    
    console.log('开始初始化应用');
    initApp();
});

// 应用初始化
function initApp() {
    console.log('开始初始化应用');
    
    // 从本地存储加载数据
    loadData();
    
    // 初始化选项卡切换
    initTabs();
    
    try {
        // 初始化日期选择器
        initDatePickers();
        console.log('日期选择器初始化完成');
    } catch (e) {
        console.error('初始化日期选择器时出错:', e);
        alert('日期选择器初始化失败: ' + e.message);
    }
    
    // 初始化记账表单
    initAccountingForm();
    
    // 初始化备用金表单
    initReserveForm();
    
    // 初始化看板
    initDashboard();
    
    // 刷新界面数据
    refreshUI();
    
    // 确保日期时间字段立即显示当前时间
    updateCurrentDateTime();
}

// 从本地存储加载数据
function loadData() {
    try {
        if (localStorage.getItem('categories')) {
            categories = JSON.parse(localStorage.getItem('categories'));
        }
        
        if (localStorage.getItem('subcategories')) {
            subcategories = JSON.parse(localStorage.getItem('subcategories'));
        }
        
        if (localStorage.getItem('accountingRecords')) {
            accountingRecords = JSON.parse(localStorage.getItem('accountingRecords'));
        }
        
        if (localStorage.getItem('reserveRecords')) {
            reserveRecords = JSON.parse(localStorage.getItem('reserveRecords'));
        }
    } catch (e) {
        console.error('加载数据失败:', e);
    }
}

// 保存数据到本地存储
function saveData() {
    try {
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('subcategories', JSON.stringify(subcategories));
        localStorage.setItem('accountingRecords', JSON.stringify(accountingRecords));
        localStorage.setItem('reserveRecords', JSON.stringify(reserveRecords));
    } catch (e) {
        console.error('保存数据失败:', e);
    }
}

// 初始化选项卡切换
function initTabs() {
    const tabItems = document.querySelectorAll('.tab-menu li');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabTarget = item.getAttribute('data-tab');
            
            // 移除所有激活状态
            tabItems.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 激活当前选项卡
            item.classList.add('active');
            document.getElementById(tabTarget).classList.add('active');
            
            // 如果切换到看板，刷新图表
            if (tabTarget === 'dashboard') {
                refreshDashboard();
            }
        });
    });
}

// 初始化日期选择器 - 简化版
function initDatePickers() {
    console.log('开始初始化日期选择器');
    
    // 确保日期选择器可用
    if (typeof flatpickr !== 'function') {
        throw new Error('日期选择器库未正确加载，无法初始化日期选择器');
    }
    
    // 记账日期选择器，只精确到日期，去掉时间
    flatpickr('#date-time', {
        enableTime: false,
        dateFormat: 'Y-m-d',
        defaultDate: new Date()
    });
    
    // 备用金日期选择器
    flatpickr('#reserve-date', {
        dateFormat: 'Y-m-d',
        defaultDate: new Date()
    });
    
    // 看板自定义日期范围选择器
    flatpickr('#start-date', {
        dateFormat: 'Y-m-d'
    });
    
    flatpickr('#end-date', {
        dateFormat: 'Y-m-d'
    });
    
    // 资金状态自定义日期范围选择器
    flatpickr('#balance-start-date', {
        dateFormat: 'Y-m-d'
    });
    
    flatpickr('#balance-end-date', {
        dateFormat: 'Y-m-d',
        defaultDate: new Date()
    });
}

// 刷新界面数据
function refreshUI() {
    refreshAccountingList();
    refreshReserveList();
    refreshDashboard();
    updateBalanceDisplay();
}

// 格式化金额显示
function formatAmount(amount) {
    return '¥' + parseFloat(amount).toFixed(2);
}

// 格式化日期显示
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit'
    });
}

// 简化日期显示（不含时间）
function formatSimpleDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit'
    });
}

// 显示模态框
function showModal(title, content) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    
    modal.style.display = 'block';
    
    // 关闭按钮事件
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    
    // 点击模态框外部关闭
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ==================== 记账模块 ====================

// 初始化记账表单
function initAccountingForm() {
    // 更新分类下拉列表
    updateCategoryDatalist();
    
    // 分类输入框事件
    const categoryInput = document.getElementById('category');
    categoryInput.addEventListener('input', function() {
        const selectedCategory = this.value;
        toggleSubcategoryGroup(selectedCategory);
        updateSubcategoryDatalist(selectedCategory);
    });
    
    // 添加分类按钮事件
    const addCategoryBtn = document.getElementById('add-category');
    addCategoryBtn.addEventListener('click', function() {
        const categoryInput = document.getElementById('category');
        const newCategory = categoryInput.value.trim();
        
        if (newCategory && !categories.includes(newCategory)) {
            categories.push(newCategory);
            subcategories[newCategory] = [];
            updateCategoryDatalist();
            saveData();
            
            showModal('成功', `已添加新分类 "${newCategory}"`);
        } else if (categories.includes(newCategory)) {
            showModal('提示', '该分类已存在');
        } else {
            showModal('提示', '请输入有效的分类名称');
        }
    });
    
    // 添加二级标签按钮事件
    const addSubcategoryBtn = document.getElementById('add-subcategory');
    addSubcategoryBtn.addEventListener('click', function() {
        const categoryInput = document.getElementById('category');
        const subcategoryInput = document.getElementById('subcategory');
        const category = categoryInput.value.trim();
        const newSubcategory = subcategoryInput.value.trim();
        
        if (!categories.includes(category)) {
            showModal('提示', '请先选择或创建一个有效的分类');
            return;
        }
        
        if (newSubcategory) {
            if (!subcategories[category]) {
                subcategories[category] = [];
            }
            
            if (!subcategories[category].includes(newSubcategory)) {
                subcategories[category].push(newSubcategory);
                updateSubcategoryDatalist(category);
                saveData();
                
                showModal('成功', `已添加二级标签 "${newSubcategory}" 到 "${category}"`);
            } else {
                showModal('提示', '该二级标签已存在');
            }
        } else {
            showModal('提示', '请输入有效的二级标签名称');
        }
    });
    
    // 金额输入验证
    const amountInput = document.getElementById('amount');
    amountInput.addEventListener('input', function() {
        if (this.value < 0) {
            this.value = 0;
        }
    });
    
    // 表单提交事件
    const accountingForm = document.getElementById('accounting-form');
    accountingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveAccountingRecord();
    });
}

// 更新分类下拉列表
function updateCategoryDatalist() {
    const datalist = document.getElementById('categories');
    datalist.innerHTML = '';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        datalist.appendChild(option);
    });
}

// 更新二级标签下拉列表
function updateSubcategoryDatalist(category) {
    const datalist = document.getElementById('subcategories');
    datalist.innerHTML = '';
    
    if (subcategories[category]) {
        subcategories[category].forEach(subcategory => {
            const option = document.createElement('option');
            option.value = subcategory;
            datalist.appendChild(option);
        });
    }
}

// 切换二级标签组显示状态
function toggleSubcategoryGroup(category) {
    const subcategoryGroup = document.getElementById('subcategory-group');
    
    if (category && categories.includes(category) && subcategories[category] && subcategories[category].length > 0) {
        subcategoryGroup.style.display = 'block';
    } else {
        subcategoryGroup.style.display = 'none';
    }
}

// 保存记账记录
function saveAccountingRecord() {
    const dateTime = document.getElementById('date-time').value;
    const category = document.getElementById('category').value.trim();
    const subcategory = document.getElementById('subcategory').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const notes = document.getElementById('notes').value.trim();
    
    // 验证输入
    if (!dateTime) {
        showModal('提示', '请选择日期和时间');
        return;
    }
    
    if (!category) {
        showModal('提示', '请选择或输入分类');
        return;
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
        showModal('提示', '请输入有效的金额');
        return;
    }
    
    // 创建记录对象，金额使用负数表示支出
    const record = {
        id: generateId(),
        dateTime: dateTime,
        category: category,
        subcategory: subcategory,
        amount: -amount, // 将用户输入的正数转换为负数
        notes: notes,
        createdAt: new Date().toISOString()
    };
    
    // 添加到记录数组
    accountingRecords.unshift(record);
    
    // 如果是新分类，添加到分类列表
    if (!categories.includes(category)) {
        categories.push(category);
        subcategories[category] = [];
        updateCategoryDatalist();
    }
    
    // 如果是新二级标签，添加到二级标签列表
    if (subcategory && !subcategories[category].includes(subcategory)) {
        subcategories[category].push(subcategory);
    }
    
    // 保存数据
    saveData();
    
    // 重置表单
    document.getElementById('amount').value = '';
    document.getElementById('notes').value = '';
    
    // 刷新UI
    refreshUI();
    
    showModal('成功', '记账记录已保存');
}

// 刷新记账记录列表
function refreshAccountingList() {
    const recentRecords = document.getElementById('recent-records');
    recentRecords.innerHTML = '';
    
    if (accountingRecords.length === 0) {
        recentRecords.innerHTML = '<div class="empty-records">暂无记录</div>';
        return;
    }
    
    // 显示最近的10条记录
    const recordsToShow = accountingRecords.slice(0, 10);
    
    recordsToShow.forEach(record => {
        const recordElement = createRecordElement(record, 'accounting');
        recentRecords.appendChild(recordElement);
    });
}

// 创建记录元素
function createRecordElement(record, type) {
    const recordElement = document.createElement('div');
    recordElement.className = 'record-item';
    recordElement.setAttribute('data-id', record.id);
    
    let recordContent = '';
    
    if (type === 'accounting') {
        recordContent = `
            <div class="record-content">
                <div class="record-left">
                    <div class="record-icon">💰</div>
                    <div class="record-info">
                        <span class="record-title">${record.category}${record.subcategory ? ' - ' + record.subcategory : ''}</span>
                        <span class="record-date">${formatDate(record.dateTime)}</span>
                    </div>
                </div>
                <span class="record-amount">-${formatAmount(record.amount)}</span>
            </div>
            <div class="record-actions">
                <button class="action-btn edit" title="编辑"></button>
                <button class="action-btn delete" title="删除"></button>
            </div>
        `;
    } else if (type === 'reserve') {
        recordContent = `
            <div class="record-content">
                <div class="record-left">
                    <div class="record-icon">💴</div>
                    <div class="record-info">
                        <span class="record-title">备用金发放</span>
                        <span class="record-date">${formatSimpleDate(record.dateTime)}</span>
                    </div>
                </div>
                <span class="record-amount positive">+${formatAmount(record.amount)}</span>
            </div>
            <div class="record-actions">
                <button class="action-btn edit" title="编辑"></button>
                <button class="action-btn delete" title="删除"></button>
            </div>
        `;
    }
    
    recordElement.innerHTML = recordContent;
    
    // 添加编辑按钮事件
    const editBtn = recordElement.querySelector('.action-btn.edit');
    editBtn.addEventListener('click', function() {
        editRecord(record.id, type);
    });
    
    // 添加删除按钮事件
    const deleteBtn = recordElement.querySelector('.action-btn.delete');
    deleteBtn.addEventListener('click', function() {
        deleteRecord(record.id, type);
    });
    
    return recordElement;
}

// 编辑记录
function editRecord(id, type) {
    let record;
    let formHtml;
    
    if (type === 'accounting') {
        record = accountingRecords.find(r => r.id === id);
        if (!record) return;
        
        formHtml = `
            <form id="edit-accounting-form">
                <div class="form-group">
                    <label for="edit-date-time">日期时间</label>
                    <input type="text" id="edit-date-time" value="${record.dateTime}" readonly>
                </div>
                <div class="form-group">
                    <label for="edit-category">分类</label>
                    <input type="text" id="edit-category" value="${record.category}" list="edit-categories">
                    <datalist id="edit-categories">
                        ${categories.map(c => `<option value="${c}">`).join('')}
                    </datalist>
                </div>
                <div class="form-group">
                    <label for="edit-subcategory">二级标签</label>
                    <input type="text" id="edit-subcategory" value="${record.subcategory || ''}" list="edit-subcategories">
                    <datalist id="edit-subcategories">
                        ${subcategories[record.category] ? subcategories[record.category].map(s => `<option value="${s}">`).join('') : ''}
                    </datalist>
                </div>
                <div class="form-group">
                    <label for="edit-amount">金额</label>
                    <input type="number" id="edit-amount" value="${record.amount}" step="0.01" min="0.01">
                </div>
                <div class="form-group">
                    <label for="edit-notes">备注</label>
                    <textarea id="edit-notes">${record.notes || ''}</textarea>
                </div>
                <button type="submit" class="btn-primary">保存修改</button>
            </form>
        `;
    } else if (type === 'reserve') {
        record = reserveRecords.find(r => r.id === id);
        if (!record) return;
        
        formHtml = `
            <form id="edit-reserve-form">
                <div class="form-group">
                    <label for="edit-reserve-date">发放日期</label>
                    <input type="text" id="edit-reserve-date" value="${record.dateTime}" readonly>
                </div>
                <div class="form-group">
                    <label for="edit-reserve-amount">发放金额</label>
                    <input type="number" id="edit-reserve-amount" value="${record.amount}" min="1" step="1">
                </div>
                <div class="form-group">
                    <label for="edit-reserve-notes">备注</label>
                    <textarea id="edit-reserve-notes">${record.notes || ''}</textarea>
                </div>
                <button type="submit" class="btn-primary">保存修改</button>
            </form>
        `;
    }
    
    showModal(`编辑${type === 'accounting' ? '记账' : '备用金'}记录`, formHtml);
    
    // 初始化日期选择器
    if (type === 'accounting') {
        flatpickr('#edit-date-time', {
            enableTime: false,
            dateFormat: 'Y-m-d',
            defaultDate: record.dateTime
        });
        
        const editForm = document.getElementById('edit-accounting-form');
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 更新记录
            record.dateTime = document.getElementById('edit-date-time').value;
            record.category = document.getElementById('edit-category').value.trim();
            record.subcategory = document.getElementById('edit-subcategory').value.trim();
            record.amount = parseFloat(document.getElementById('edit-amount').value);
            record.notes = document.getElementById('edit-notes').value.trim();
            
            // 保存数据
            saveData();
            
            // 刷新UI
            refreshUI();
            
            // 关闭模态框
            document.getElementById('modal').style.display = 'none';
            
            showModal('成功', '记录已更新');
        });
    } else if (type === 'reserve') {
        flatpickr('#edit-reserve-date', {
            dateFormat: 'Y-m-d',
            defaultDate: record.dateTime
        });
        
        const editForm = document.getElementById('edit-reserve-form');
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 更新记录
            record.dateTime = document.getElementById('edit-reserve-date').value;
            record.amount = parseFloat(document.getElementById('edit-reserve-amount').value);
            record.notes = document.getElementById('edit-reserve-notes').value.trim();
            
            // 保存数据
            saveData();
            
            // 刷新UI
            refreshUI();
            
            // 关闭模态框
            document.getElementById('modal').style.display = 'none';
            
            showModal('成功', '记录已更新');
        });
    }
}

// 删除记录
function deleteRecord(id, type) {
    const confirmHtml = `
        <p>确定要删除这条${type === 'accounting' ? '记账' : '备用金'}记录吗？</p>
        <div class="confirm-actions">
            <button id="cancel-delete" class="confirm-btn cancel">取消</button>
            <button id="confirm-delete" class="confirm-btn confirm">确认</button>
        </div>
    `;
    
    showModal('删除确认', confirmHtml);
    
    document.getElementById('cancel-delete').addEventListener('click', function() {
        document.getElementById('modal').style.display = 'none';
    });
    
    document.getElementById('confirm-delete').addEventListener('click', function() {
        if (type === 'accounting') {
            // 删除记账记录
            accountingRecords = accountingRecords.filter(record => record.id !== id);
        } else if (type === 'reserve') {
            // 删除备用金记录
            reserveRecords = reserveRecords.filter(record => record.id !== id);
        }
        
        // 保存数据
        saveData();
        
        // 刷新UI
        refreshUI();
        
        // 关闭确认删除模态框
        document.getElementById('modal').style.display = 'none';
        
        // 使用setTimeout延迟显示删除成功提示，确保先关闭确认删除模态框
        setTimeout(function() {
            showModal('成功', '记录已删除');
        }, 100);
    });
}

// ==================== 备用金管理 ====================

// 初始化备用金表单
function initReserveForm() {
    // 表单提交事件
    const reserveForm = document.getElementById('reserve-form');
    reserveForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveReserveRecord();
    });
}

// 保存备用金记录
function saveReserveRecord() {
    const date = document.getElementById('reserve-date').value;
    const amount = parseInt(document.getElementById('reserve-amount').value);
    const notes = document.getElementById('reserve-notes').value.trim();
    
    // 验证输入
    if (!date) {
        showModal('提示', '请选择发放日期');
        return;
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
        showModal('提示', '请输入有效的整数金额');
        return;
    }
    
    // 创建记录对象
    const record = {
        id: generateId(),
        dateTime: date,
        amount: amount,
        notes: notes,
        createdAt: new Date().toISOString()
    };
    
    // 添加到记录数组
    reserveRecords.unshift(record);
    
    // 保存数据
    saveData();
    
    // 重置表单
    document.getElementById('reserve-amount').value = '';
    document.getElementById('reserve-notes').value = '';
    
    // 刷新UI
    refreshUI();
    
    showModal('成功', '备用金记录已保存');
}

// 刷新备用金记录列表
function refreshReserveList() {
    const reserveList = document.getElementById('reserve-records');
    reserveList.innerHTML = '';
    
    if (reserveRecords.length === 0) {
        reserveList.innerHTML = '<div class="empty-records">暂无记录</div>';
        return;
    }
    
    // 按日期倒序排列备用金记录
    const sortedRecords = [...reserveRecords].sort((a, b) => {
        return new Date(b.dateTime) - new Date(a.dateTime);
    });
    
    sortedRecords.forEach(record => {
        const recordElement = createRecordElement(record, 'reserve');
        reserveList.appendChild(recordElement);
    });
}

// ==================== 余额计算 ====================

// 根据日期范围过滤记录
function filterRecordsByDateRange(records, dateRange) {
    if (!dateRange.start || !dateRange.end) {
        return records;
    }
    
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    return records.filter(record => {
        const recordDate = new Date(record.dateTime);
        return recordDate >= startDate && recordDate <= endDate;
    });
}

// 计算当前余额
function calculateBalance() {
    // 如果设置了日期范围，则过滤记录
    let filteredReserveRecords = reserveRecords;
    let filteredAccountingRecords = accountingRecords;

    if (balanceDateRange.start && balanceDateRange.end) {
        filteredReserveRecords = filterRecordsByDateRange(reserveRecords, balanceDateRange);
        filteredAccountingRecords = filterRecordsByDateRange(accountingRecords, balanceDateRange);
    }
    
    // 计算总备用金金额（收入）
    const totalReserve = filteredReserveRecords.reduce((sum, record) => sum + record.amount, 0);
    
    // 计算总支出金额（支出已经是负数，所以直接累加）
    const totalExpense = filteredAccountingRecords.reduce((sum, record) => sum + record.amount, 0);
    
    // 计算当前余额 = 总收入 - 总支出
    // 因为支出已经是负数，所以直接相加即可
    const currentBalance = totalReserve + totalExpense;
    
    return {
        totalReserve,
        totalExpense: Math.abs(totalExpense), // 显示时使用绝对值
        currentBalance
    };
}

// 更新余额显示
function updateBalanceDisplay() {
    const { totalReserve, totalExpense, currentBalance } = calculateBalance();
    
    // 更新余额显示
    const balanceElement = document.getElementById('current-balance');
    balanceElement.textContent = formatAmount(currentBalance);
    
    // 更新余额颜色
    balanceElement.className = 'balance-amount';
    if (currentBalance > 0) {
        balanceElement.classList.add('positive');
    } else if (currentBalance < 0) {
        balanceElement.classList.add('negative');
    } else if (currentBalance > 0 && currentBalance < totalReserve * 0.1) {
        balanceElement.classList.add('warning');
    }
    
    // 更新进度条
    const balanceBar = document.getElementById('balance-bar');
    
    // 设置进度条宽度和颜色
    if (totalReserve > 0) {
        // 计算百分比
        let percentage = (currentBalance / totalReserve) * 100;
        
        // 限制在0-100之间
        percentage = Math.max(0, Math.min(100, percentage));
        
        balanceBar.style.width = percentage + '%';
        
        // 设置颜色
        balanceBar.className = 'balance-bar';
        if (currentBalance < 0) {
            balanceBar.classList.add('danger');
        } else if (currentBalance < totalReserve * 0.1) {
            balanceBar.classList.add('warning');
        }
    } else {
        balanceBar.style.width = '0';
    }
    
    // 更新总额显示
    document.getElementById('total-reserve').textContent = formatAmount(totalReserve);
    document.getElementById('total-expense').textContent = formatAmount(totalExpense);
}

// ==================== 看板模块 ====================

// 初始化看板
function initDashboard() {
    try {
        // 初始化图表
        initCharts();
        
        // 初始化筛选器
        initDashboardFilters();
        
        // 初始化余额日期筛选器
        initBalanceDateFilters();
        
        // 设置默认日期范围
        setDateRangeForPeriod('all');
        
        // 延迟刷新看板，确保 DOM 已完全加载
        setTimeout(() => {
            refreshDashboard();
        }, 100);
        
        console.log('看板初始化完成');
    } catch (error) {
        console.error('初始化看板失败:', error);
    }
}

// 初始化图表
function initCharts() {
    try {
        // 检查 Chart.js 是否已加载
        if (typeof Chart === 'undefined') {
            console.error('Chart.js 未加载');
            return;
        }

        // 获取图表容器
        const expenseCategoryCanvas = document.querySelector('#expense-chart');
        const trendChartCanvas = document.querySelector('#trend-chart');

        if (!expenseCategoryCanvas || !trendChartCanvas) {
            console.error('找不到图表容器');
            return;
        }

        // 初始化支出分类图表（环形图）
        expenseChart = new Chart(expenseCategoryCanvas, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF',
                        '#FF9F40'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.formattedValue;
                                const dataset = context.dataset;
                                const total = dataset.data.reduce((acc, data) => acc + data, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${label}: ¥${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        // 初始化趋势图表（折线图）
        trendChart = new Chart(trendChartCanvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '支出',
                    data: [],
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '¥' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return '支出: ¥' + context.formattedValue;
                            }
                        }
                    }
                }
            }
        });

        console.log('图表初始化成功');
    } catch (error) {
        console.error('图表初始化失败:', error);
    }
}

// 初始化看板过滤器
function initDashboardFilters() {
    // 选择数据统计卡片内的过滤按钮
    const dataFilterButtons = document.querySelector('#dashboard .card:nth-child(2) .filter-group').querySelectorAll('.filter-btn');
    const customDateRange = document.getElementById('custom-date-range');
    
    // 设置默认为全部
    setDateRangeForPeriod('all');
    
    // 数据统计过滤按钮点击事件
    dataFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const period = this.getAttribute('data-period');
            
            // 移除所有数据统计过滤按钮的活动状态
            dataFilterButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加活动状态到当前按钮
            this.classList.add('active');
            
            // 如果选择自定义，显示日期选择器
            if (period === 'custom') {
                customDateRange.style.display = 'block';
            } else {
                customDateRange.style.display = 'none';
                setDateRangeForPeriod(period);
                refreshDashboard();
            }
        });
    });
    
    // 应用自定义日期范围按钮
    document.getElementById('apply-date-range').addEventListener('click', function() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        if (startDate && endDate) {
            dashboardDateRange.start = new Date(startDate);
            dashboardDateRange.end = new Date(endDate);
            dashboardDateRange.end.setHours(23, 59, 59, 999); // 设置为当天结束
            
            refreshDashboard();
        } else {
            showModal('提示', '请选择完整的日期范围');
        }
    });
}

// 根据周期设置日期范围
function setDateRangeForPeriod(period) {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    
    switch (period) {
        case 'week':
            // 本周（周一到周日）
            start = new Date(now);
            start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
            start.setHours(0, 0, 0, 0);
            end = new Date(now);
            end.setHours(23, 59, 59, 999);
            break;
            
        case 'month':
            // 本月
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            start.setHours(0, 0, 0, 0);
            end = new Date(now);
            end.setHours(23, 59, 59, 999);
            break;
            
        case 'quarter':
            // 近三个月
            start = new Date(now);
            start.setMonth(now.getMonth() - 2);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end = new Date(now);
            end.setHours(23, 59, 59, 999);
            break;
            
        case 'all':
            // 全部数据，使用null
            start = null;
            end = null;
            break;
    }
    
    dashboardDateRange.start = start;
    dashboardDateRange.end = end;
}

// 计算报表周期
function calculateReportPeriods(reportType, periodValue) {
    let startDate, endDate, previousStartDate, previousEndDate;
    
    console.log('计算报表周期:', reportType, periodValue);
    
    if (reportType === 'custom') {
        // 自定义日期范围
        startDate = new Date(periodValue.startDate);
        endDate = new Date(periodValue.endDate);
        
        // 计算同等时长的上一周期
        const daysDiff = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousStartDate.getDate() - daysDiff);
    } else {
        // 预设周期
        console.log('周期值:', periodValue);
        
        // 确保我们有一个有效的日期字符串
        if (typeof periodValue !== 'string' || !periodValue.match(/^\d{4}-\d{2}-\d{2}/)) {
            console.error('无效的周期值:', periodValue);
            // 使用当前月份作为后备
            const now = new Date();
            periodValue = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            console.log('使用后备周期值:', periodValue);
        }
        
        startDate = new Date(periodValue);
        endDate = new Date(startDate);
        previousStartDate = new Date(startDate);
        previousEndDate = new Date(startDate);
        
        console.log('初始日期解析:', startDate);
        
        if (reportType === 'monthly') {
            // 月度报表：当月1日至月末
            console.log('月度报表 - 月份索引:', startDate.getMonth());
            
            // 确保开始日期是当月1号
            startDate.setDate(1);
            
            // 结束日期是下月0号（即当月最后一天）
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            
            console.log('月度报表范围:', 
                `${startDate.getFullYear()}-${startDate.getMonth()+1}-${startDate.getDate()}`,
                '至',
                `${endDate.getFullYear()}-${endDate.getMonth()+1}-${endDate.getDate()}`
            );
            
            // 上月同期
            previousStartDate = new Date(startDate);
            previousStartDate.setMonth(previousStartDate.getMonth() - 1);
            
            previousEndDate = new Date(previousStartDate.getFullYear(), previousStartDate.getMonth() + 1, 0);
        } else if (reportType === 'quarterly') {
            // 季度报表：季度首月1日至季度末月最后一天
            endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, 0);
            
            // 上季度同期
            previousStartDate.setMonth(previousStartDate.getMonth() - 3);
            previousEndDate = new Date(previousStartDate.getFullYear(), previousStartDate.getMonth() + 3, 0);
        } else if (reportType === 'yearly') {
            // 年度报表：1月1日至12月31日
            endDate = new Date(startDate.getFullYear(), 11, 31);
            
            // 上年同期
            previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
            previousEndDate.setFullYear(previousEndDate.getFullYear() - 1);
        }
    }
    
    // 设置开始日期为当天开始，结束日期为当天结束
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    previousStartDate.setHours(0, 0, 0, 0);
    previousEndDate.setHours(23, 59, 59, 999);
    
    console.log('最终报表周期范围:');
    console.log('- 当前周期:', startDate, '至', endDate);
    console.log('- 上一周期:', previousStartDate, '至', previousEndDate);
    
    return {
        currentPeriod: { start: startDate, end: endDate },
        previousPeriod: { start: previousStartDate, end: previousEndDate }
    };
}

// 计算周期统计数据
function calculatePeriodStats(accountingRecords, reserveRecords) {
    // 计算总支出
    const totalExpense = accountingRecords.reduce((sum, record) => sum + record.amount, 0);
    
    // 计算总收入（备用金）
    const totalReserve = reserveRecords.reduce((sum, record) => sum + record.amount, 0);
    
    // 计算余额变化
    const balanceChange = totalReserve - totalExpense;
    
    return {
        totalExpense,
        totalReserve,
        balanceChange
    };
}

// 获取报表标题
function getReportTitle(reportType, periodValue) {
    if (reportType === 'custom') {
        // 自定义报表标题
        const startDate = new Date(periodValue.startDate);
        const endDate = new Date(periodValue.endDate);
        return `${formatSimpleDate(startDate)} 至 ${formatSimpleDate(endDate)} 自定义报表`;
    }
    
    if (reportType === 'monthly') {
        // 优先使用下拉选项中保存的显示月份
        const periodSelect = document.getElementById('report-period');
        const selectedOption = periodSelect.options[periodSelect.selectedIndex];
        if (selectedOption && selectedOption.hasAttribute('data-display-month')) {
            const displayMonth = selectedOption.getAttribute('data-display-month');
            const date = new Date(periodValue);
            return `${date.getFullYear()}年${displayMonth}月 月度报表`;
        } else {
            // 后备方案：使用Date对象的getMonth() + 1
            const date = new Date(periodValue);
            return `${date.getFullYear()}年${date.getMonth() + 1}月 月度报表`;
        }
    } else if (reportType === 'quarterly') {
        const date = new Date(periodValue);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}年第${quarter}季度 季度报表`;
    } else if (reportType === 'yearly') {
        const date = new Date(periodValue);
        return `${date.getFullYear()}年 年度报表`;
    }
    
    return '报表';
}

// 更新报表摘要
function updateReportSummary(currentStats, previousStats) {
    document.getElementById('report-total-expense').textContent = formatAmount(currentStats.totalExpense);
    document.getElementById('report-total-reserve').textContent = formatAmount(currentStats.totalReserve);
    document.getElementById('report-balance-change').textContent = formatAmount(currentStats.balanceChange);
    
    // 设置颜色
    const balanceElement = document.getElementById('report-balance-change');
    balanceElement.className = 'summary-value';
    
    if (currentStats.balanceChange > 0) {
        balanceElement.classList.add('positive');
    } else if (currentStats.balanceChange < 0) {
        balanceElement.classList.add('negative');
    }
}

// 更新报表图表
function updateReportCharts(currentAccounting, previousAccounting, showCompared) {
    // 初始化支出分布图表
    const expenseCtx = document.getElementById('report-expense-chart').getContext('2d');
    
    if (reportExpenseChart) {
        reportExpenseChart.destroy();
    }
    
    // 按分类统计金额
    const categoryTotals = {};
    
    currentAccounting.forEach(record => {
        if (categoryTotals[record.category]) {
            categoryTotals[record.category] += record.amount;
        } else {
            categoryTotals[record.category] = record.amount;
        }
    });
    
    // 转换为图表数据
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    // 创建支出分布图表
    reportExpenseChart = new Chart(expenseCtx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#4a6cf7', '#28a745', '#ffc107', '#dc3545', '#6c757d',
                    '#17a2b8', '#fd7e14', '#20c997', '#6610f2', '#e83e8c'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${formatAmount(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    // 只有在需要显示同比/环比分析时才创建对比图表
    if (showCompared) {
        // 初始化对比分析图表
        const comparisonCtx = document.getElementById('report-comparison-chart').getContext('2d');
        
        if (reportComparisonChart) {
            reportComparisonChart.destroy();
        }
        
        // 按分类统计本期和上期的金额
        const currentCategoryTotals = {};
        const previousCategoryTotals = {};
        
        // 统计本期数据
        currentAccounting.forEach(record => {
            if (currentCategoryTotals[record.category]) {
                currentCategoryTotals[record.category] += record.amount;
            } else {
                currentCategoryTotals[record.category] = record.amount;
            }
        });
        
        // 统计上期数据
        previousAccounting.forEach(record => {
            if (previousCategoryTotals[record.category]) {
                previousCategoryTotals[record.category] += record.amount;
            } else {
                previousCategoryTotals[record.category] = record.amount;
            }
        });
        
        // 合并所有分类
        const allCategories = [...new Set([...Object.keys(currentCategoryTotals), ...Object.keys(previousCategoryTotals)])];
        
        // 准备图表数据
        const currentData = allCategories.map(category => currentCategoryTotals[category] || 0);
        const previousData = allCategories.map(category => previousCategoryTotals[category] || 0);
        
        // 创建对比分析图表
        reportComparisonChart = new Chart(comparisonCtx, {
            type: 'bar',
            data: {
                labels: allCategories,
                datasets: [
                    {
                        label: '本期',
                        data: currentData,
                        backgroundColor: 'rgba(74, 108, 247, 0.7)',
                        borderColor: 'rgba(74, 108, 247, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '上期',
                        data: previousData,
                        backgroundColor: 'rgba(108, 117, 125, 0.7)',
                        borderColor: 'rgba(108, 117, 125, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatAmount(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${formatAmount(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// 更新报表明细记录
function updateReportRecords(accountingRecords, reserveRecords) {
    const recordsContainer = document.getElementById('report-records');
    recordsContainer.innerHTML = '';
    
    // 合并并按日期排序记录
    const allRecords = [];
    
    accountingRecords.forEach(record => {
        allRecords.push({
            type: 'accounting',
            data: record
        });
    });
    
    reserveRecords.forEach(record => {
        allRecords.push({
            type: 'reserve',
            data: record
        });
    });
    
    // 按日期倒序排序
    allRecords.sort((a, b) => {
        return new Date(b.data.dateTime) - new Date(a.data.dateTime);
    });
    
    // 创建记录元素
    allRecords.forEach(record => {
        let recordHtml = '';
        
        if (record.type === 'accounting') {
            recordHtml = `
                <div class="record-item">
                    <div class="record-header">
                        <span class="record-title">${record.data.category}${record.data.subcategory ? ' - ' + record.data.subcategory : ''}</span>
                        <span class="record-amount">-${formatAmount(record.data.amount)}</span>
                    </div>
                    <div class="record-details">
                        <span>${formatDate(record.data.dateTime)}</span>
                        <span>${record.data.notes || '无备注'}</span>
                    </div>
                </div>
            `;
        } else if (record.type === 'reserve') {
            recordHtml = `
                <div class="record-item">
                    <div class="record-header">
                        <span class="record-title">备用金发放</span>
                        <span class="record-amount positive">+${formatAmount(record.data.amount)}</span>
                    </div>
                    <div class="record-details">
                        <span>${formatSimpleDate(record.data.dateTime)}</span>
                        <span>${record.data.notes || '无备注'}</span>
                    </div>
                </div>
            `;
        }
        
        recordsContainer.innerHTML += recordHtml;
    });
}

// 导出Excel
function exportToExcel() {
    showModal('提示', '导出Excel功能在此静态HTML版本中暂不可用。<br>实际Android应用中，可以调用原生接口实现此功能。');
}

// 导出PDF
function exportToPDF() {
    showModal('提示', '导出PDF功能在此静态HTML版本中暂不可用。<br>实际Android应用中，可以调用原生接口实现此功能。');
}

// 更新日期时间字段为当前时间
function updateCurrentDateTime() {
    const now = new Date();
    const formattedDateTime = now.getFullYear() + '-' + 
                             padZero(now.getMonth() + 1) + '-' + 
                             padZero(now.getDate()) + ' ' + 
                             padZero(now.getHours()) + ':' + 
                             padZero(now.getMinutes());
    
    // 确保记账页面的日期时间字段已设置
    const dateTimeInput = document.getElementById('date-time');
    if(dateTimeInput && !dateTimeInput.value) {
        dateTimeInput.value = formattedDateTime;
    }
}

// 补零函数
function padZero(num) {
    return num < 10 ? '0' + num : num;
}

// 初始化资金状态日期范围筛选
function initBalanceDateFilters() {
    // 获取筛选按钮和自定义日期范围区域
    const balanceFilterButtons = document.querySelectorAll('#dashboard .card:nth-child(1) .filter-group .filter-btn');
    const customDateRange = document.getElementById('balance-custom-date-range');
    
    // 默认显示全部数据
    setBalanceDateRangeForPeriod('all');
    updateBalanceDisplay();
    
    // 筛选按钮点击事件
    balanceFilterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const rangePeriod = this.getAttribute('data-range');
            
            // 移除所有资金状态按钮的活动状态
            balanceFilterButtons.forEach(btn => btn.classList.remove('active'));
            
            // 添加当前按钮的活动状态
            this.classList.add('active');
            
            // 处理自定义日期范围的显示/隐藏
            if (rangePeriod === 'custom') {
                customDateRange.style.display = 'block';
            } else {
                customDateRange.style.display = 'none';
                
                // 设置日期范围并更新余额显示
                setBalanceDateRangeForPeriod(rangePeriod);
                updateBalanceDisplay();
            }
        });
    });
    
    // 应用自定义日期范围按钮
    document.getElementById('apply-balance-date-range').addEventListener('click', function() {
        const startDate = document.getElementById('balance-start-date').value;
        const endDate = document.getElementById('balance-end-date').value;
        
        if (startDate && endDate) {
            balanceDateRange.start = new Date(startDate);
            balanceDateRange.start.setHours(0, 0, 0, 0);
            
            balanceDateRange.end = new Date(endDate);
            balanceDateRange.end.setHours(23, 59, 59, 999);
            
            updateBalanceDisplay();
        } else {
            showModal('提示', '请选择完整的日期范围');
        }
    });
}

// 根据选定的期间设置余额显示的日期范围
function setBalanceDateRangeForPeriod(period) {
    const now = new Date();
    
    switch (period) {
        case 'all': // 所有数据
            balanceDateRange.start = null;
            balanceDateRange.end = null;
            break;
            
        case 'month': // 本月数据
            balanceDateRange.start = new Date(now.getFullYear(), now.getMonth(), 1);
            balanceDateRange.start.setHours(0, 0, 0, 0);
            
            balanceDateRange.end = new Date();
            balanceDateRange.end.setHours(23, 59, 59, 999);
            break;
            
        case 'custom': // 自定义范围，不在此处设置，由apply按钮处理
            // 保持当前设置不变
            break;
    }
}

// 刷新看板
function refreshDashboard() {
    try {
        console.log('开始刷新看板');
        console.log('当前记录数:', accountingRecords.length);
        
        // 获取当前日期范围内的记录
        const filteredRecords = filterRecordsByDateRange(accountingRecords, dashboardDateRange);
        console.log('过滤后的记录数:', filteredRecords.length);
        
        // 更新图表
        if (expenseChart) {
            updateExpenseCategoryChart(filteredRecords);
        } else {
            console.warn('支出分类图表未初始化，跳过更新');
        }
        
        if (trendChart) {
            updateTrendChart(filteredRecords);
        } else {
            console.warn('趋势图表未初始化，跳过更新');
        }

        // 更新统计数据
        updateDashboardStats(filteredRecords);

        console.log('看板刷新完成');
    } catch (error) {
        console.error('刷新看板失败:', error);
    }
}

// 更新支出分类图表
function updateExpenseCategoryChart(records) {
    if (!expenseChart) {
        console.error('支出分类图表未初始化');
        return;
    }

    try {
        console.log('开始更新支出分类图表');
        console.log('记录数:', records.length);
        console.log('原始记录:', records);
        
        // 按分类汇总支出
        const categoryTotals = {};
        records.forEach(record => {
            console.log('处理记录:', record);
            if (record.amount < 0) { // 只统计支出
                const category = record.category;
                categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(record.amount);
            }
        });

        console.log('分类汇总:', categoryTotals);

        // 按金额降序排序
        const sortedCategories = Object.entries(categoryTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6); // 只显示前6个分类

        console.log('排序后的分类:', sortedCategories);

        // 更新图表数据
        expenseChart.data.labels = sortedCategories.map(([category]) => category);
        expenseChart.data.datasets[0].data = sortedCategories.map(([,amount]) => amount);
        expenseChart.update();

        console.log('支出分类图表更新完成');
    } catch (error) {
        console.error('更新支出分类图表失败:', error);
    }
}

// 更新趋势图表
function updateTrendChart(records) {
    if (!trendChart) {
        console.error('趋势图表未初始化');
        return;
    }

    try {
        console.log('开始更新趋势图表');
        console.log('记录数:', records.length);
        console.log('原始记录:', records);
        
        // 按日期分组并计算每日支出
        const dailyExpenses = {};
        records.forEach(record => {
            console.log('处理记录:', record);
            if (record.amount < 0) { // 只统计支出
                const date = record.dateTime.split(' ')[0];
                dailyExpenses[date] = (dailyExpenses[date] || 0) + Math.abs(record.amount);
            }
        });

        console.log('每日支出:', dailyExpenses);

        // 获取日期范围
        const dates = Object.keys(dailyExpenses).sort();
        if (dates.length === 0) {
            console.log('没有支出数据');
            trendChart.data.labels = [];
            trendChart.data.datasets[0].data = [];
            trendChart.update();
            return;
        }

        // 更新图表数据
        trendChart.data.labels = dates;
        trendChart.data.datasets[0].data = dates.map(date => dailyExpenses[date] || 0);
        trendChart.update();

        console.log('趋势图表更新完成');
    } catch (error) {
        console.error('更新趋势图表失败:', error);
    }
}

// 更新仪表板统计数据
function updateDashboardStats(records) {
    try {
        // 计算总收入和支出
        let totalIncome = 0;
        let totalExpense = 0;
        records.forEach(record => {
            if (record.amount > 0) {
                totalIncome += record.amount;
            } else {
                totalExpense -= record.amount;
            }
        });

        // 更新显示
        const incomeElement = document.querySelector('#dashboard .total-income');
        const expenseElement = document.querySelector('#dashboard .total-expense');
        const netChangeElement = document.querySelector('#dashboard .net-change');

        if (incomeElement) incomeElement.textContent = `¥${totalIncome.toFixed(2)}`;
        if (expenseElement) expenseElement.textContent = `¥${totalExpense.toFixed(2)}`;
        if (netChangeElement) netChangeElement.textContent = `¥${(totalIncome - totalExpense).toFixed(2)}`;

    } catch (error) {
        console.error('更新仪表板统计数据失败:', error);
    }
}

// 生成测试数据
function generateTestData() {
    try {
        console.log('开始生成测试数据');
        
        // 清空现有数据
        accountingRecords = [];
        
        // 生成过去30天的数据
        const categories = ['餐饮', '交通', '购物', '娱乐', '生活用品'];
        const now = new Date();
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            
            // 每天生成1-3条记录
            const recordCount = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < recordCount; j++) {
                const category = categories[Math.floor(Math.random() * categories.length)];
                const amount = Math.random() * 100 + 10; // 生成10-110之间的支出
                
                const record = {
                    id: Date.now() + i + j,
                    dateTime: date.toISOString().split('T')[0] + ' 12:00:00',
                    category: category,
                    subcategory: '',
                    amount: -amount, // 将正数转换为负数
                    notes: '测试数据',
                    createdAt: new Date().toISOString()
                };
                
                console.log('生成记录:', record);
                accountingRecords.push(record);
            }
        }
        
        // 保存数据
        saveData();
        console.log('测试数据生成成功，共生成记录:', accountingRecords.length);
        
        // 刷新看板
        refreshDashboard();
        
    } catch (error) {
        console.error('生成测试数据失败:', error);
    }
} 