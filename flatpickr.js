/**
 * 简化版日期选择器 - 替代flatpickr
 */
(function(global) {
    // 主类
    function SimpleDatePicker(selector, options) {
        this.element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!this.element) {
            console.error('找不到元素:', selector);
            return;
        }
        
        this.options = Object.assign({
            dateFormat: 'Y-m-d',
            defaultDate: new Date(),
            enableTime: false,
            minDate: null,
            maxDate: null,
            onChange: []
        }, options || {});
        
        this.selectedDate = this.options.defaultDate;
        this._init();
    }
    
    // 初始化方法
    SimpleDatePicker.prototype._init = function() {
        // 设置输入框为只读
        this.element.readOnly = true;
        
        // 绑定点击事件
        this.element.addEventListener('click', this._onClick.bind(this));
        
        // 初始设置输入框值
        this._setInputValue(this.selectedDate);
        
        // 将实例保存到元素上
        this.element._simpleDatePicker = this;
    };
    
    // 点击输入框时的处理
    SimpleDatePicker.prototype._onClick = function() {
        this._createAndShowPicker();
    };
    
    // 创建并显示日期选择器UI
    SimpleDatePicker.prototype._createAndShowPicker = function() {
        // 创建日期选择器容器
        let container = document.createElement('div');
        container.className = 'simple-date-picker-container';
        container.style.position = 'absolute';
        container.style.backgroundColor = 'white';
        container.style.border = '1px solid #ddd';
        container.style.borderRadius = '4px';
        container.style.padding = '10px';
        container.style.boxShadow = '0 2px 5px rgba(0,0,0,0.15)';
        container.style.zIndex = '9999';
        
        // 计算位置
        const rect = this.element.getBoundingClientRect();
        container.style.top = (rect.bottom + window.scrollY) + 'px';
        container.style.left = (rect.left + window.scrollX) + 'px';
        container.style.width = '250px';
        
        // 当前显示的年月
        let currentViewDate = this.selectedDate ? new Date(this.selectedDate) : new Date();
        
        // 创建日期选择器头部
        let header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.marginBottom = '10px';
        
        // 上一月按钮
        let prevBtn = document.createElement('button');
        prevBtn.textContent = '←';
        prevBtn.style.border = 'none';
        prevBtn.style.background = 'none';
        prevBtn.style.cursor = 'pointer';
        prevBtn.onclick = () => {
            currentViewDate.setMonth(currentViewDate.getMonth() - 1);
            this._updateCalendar(container, currentViewDate);
        };
        
        // 当前年月显示
        let yearMonthDisplay = document.createElement('div');
        yearMonthDisplay.textContent = this._formatYearMonth(currentViewDate);
        
        // 下一月按钮
        let nextBtn = document.createElement('button');
        nextBtn.textContent = '→';
        nextBtn.style.border = 'none';
        nextBtn.style.background = 'none';
        nextBtn.style.cursor = 'pointer';
        nextBtn.onclick = () => {
            currentViewDate.setMonth(currentViewDate.getMonth() + 1);
            this._updateCalendar(container, currentViewDate);
        };
        
        header.appendChild(prevBtn);
        header.appendChild(yearMonthDisplay);
        header.appendChild(nextBtn);
        container.appendChild(header);
        
        // 创建日历体
        this._createCalendarBody(container, currentViewDate);
        
        // 时间选择器（如果启用）
        if (this.options.enableTime) {
            this._createTimeSelector(container);
        }
        
        // 添加到body
        document.body.appendChild(container);
        
        // 点击外部关闭
        const closeOnOutsideClick = (e) => {
            if (!container.contains(e.target) && e.target !== this.element) {
                document.body.removeChild(container);
                document.removeEventListener('click', closeOnOutsideClick);
            }
        };
        
        // 延迟添加点击监听，避免立即触发
        setTimeout(() => {
            document.addEventListener('click', closeOnOutsideClick);
        }, 100);
    };
    
    // 更新日历
    SimpleDatePicker.prototype._updateCalendar = function(container, date) {
        // 更新年月显示
        container.querySelector('div').textContent = this._formatYearMonth(date);
        
        // 移除旧的日历体
        let oldCalendarBody = container.querySelector('.calendar-body');
        if (oldCalendarBody) {
            container.removeChild(oldCalendarBody);
        }
        
        // 创建新的日历体
        this._createCalendarBody(container, date);
    };
    
    // 创建日历体
    SimpleDatePicker.prototype._createCalendarBody = function(container, date) {
        let calendarBody = document.createElement('div');
        calendarBody.className = 'calendar-body';
        
        // 星期行
        let weekRow = document.createElement('div');
        weekRow.style.display = 'flex';
        weekRow.style.justifyContent = 'space-between';
        weekRow.style.marginBottom = '5px';
        
        ['日', '一', '二', '三', '四', '五', '六'].forEach(day => {
            let dayElem = document.createElement('div');
            dayElem.textContent = day;
            dayElem.style.width = '30px';
            dayElem.style.textAlign = 'center';
            dayElem.style.fontWeight = 'bold';
            weekRow.appendChild(dayElem);
        });
        
        calendarBody.appendChild(weekRow);
        
        // 获取当月天数和第一天是周几
        let year = date.getFullYear();
        let month = date.getMonth();
        let firstDay = new Date(year, month, 1).getDay();
        let daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // 创建日期网格
        let daysGrid = document.createElement('div');
        daysGrid.style.display = 'grid';
        daysGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
        daysGrid.style.gap = '5px';
        
        // 添加空白
        for (let i = 0; i < firstDay; i++) {
            let emptyDay = document.createElement('div');
            emptyDay.style.width = '30px';
            emptyDay.style.height = '30px';
            daysGrid.appendChild(emptyDay);
        }
        
        // 添加日期
        for (let day = 1; day <= daysInMonth; day++) {
            let dayElem = document.createElement('div');
            dayElem.textContent = day;
            dayElem.style.width = '30px';
            dayElem.style.height = '30px';
            dayElem.style.display = 'flex';
            dayElem.style.justifyContent = 'center';
            dayElem.style.alignItems = 'center';
            dayElem.style.cursor = 'pointer';
            dayElem.style.borderRadius = '50%';
            
            // 检查是否是当前选中的日期
            let dateToCheck = new Date(year, month, day);
            if (this.selectedDate && 
                this.selectedDate.getFullYear() === year && 
                this.selectedDate.getMonth() === month && 
                this.selectedDate.getDate() === day) {
                dayElem.style.backgroundColor = '#4a6cf7';
                dayElem.style.color = 'white';
            }
            
            // 检查是否在限定范围内
            let isDisabled = false;
            if (this.options.minDate && dateToCheck < this.options.minDate) {
                isDisabled = true;
            }
            if (this.options.maxDate && dateToCheck > this.options.maxDate) {
                isDisabled = true;
            }
            
            if (isDisabled) {
                dayElem.style.opacity = '0.3';
                dayElem.style.cursor = 'not-allowed';
            } else {
                dayElem.addEventListener('click', () => {
                    // 设置选中日期
                    this.selectedDate = new Date(year, month, day);
                    
                    // 如果启用时间，保留之前的时间
                    if (this.options.enableTime && this.selectedDate) {
                        let hours = container.querySelector('.time-hours').value || 0;
                        let minutes = container.querySelector('.time-minutes').value || 0;
                        this.selectedDate.setHours(hours, minutes);
                    }
                    
                    // 更新输入框的值
                    this._setInputValue(this.selectedDate);
                    
                    // 触发onChange回调
                    this._triggerChange();
                    
                    // 关闭日期选择器
                    document.body.removeChild(container);
                });
                
                // 鼠标悬停效果
                dayElem.addEventListener('mouseover', () => {
                    if (!isDisabled) {
                        dayElem.style.backgroundColor = '#e6e6e6';
                    }
                });
                
                dayElem.addEventListener('mouseout', () => {
                    if (!isDisabled) {
                        if (this.selectedDate && 
                            this.selectedDate.getFullYear() === year && 
                            this.selectedDate.getMonth() === month && 
                            this.selectedDate.getDate() === day) {
                            dayElem.style.backgroundColor = '#4a6cf7';
                            dayElem.style.color = 'white';
                        } else {
                            dayElem.style.backgroundColor = '';
                            dayElem.style.color = '';
                        }
                    }
                });
            }
            
            daysGrid.appendChild(dayElem);
        }
        
        calendarBody.appendChild(daysGrid);
        container.appendChild(calendarBody);
    };
    
    // 创建时间选择器
    SimpleDatePicker.prototype._createTimeSelector = function(container) {
        let timeContainer = document.createElement('div');
        timeContainer.style.marginTop = '10px';
        timeContainer.style.display = 'flex';
        timeContainer.style.justifyContent = 'center';
        timeContainer.style.alignItems = 'center';
        
        // 小时选择
        let hoursInput = document.createElement('input');
        hoursInput.type = 'number';
        hoursInput.min = 0;
        hoursInput.max = 23;
        hoursInput.value = this.selectedDate ? this.selectedDate.getHours() : 0;
        hoursInput.style.width = '40px';
        hoursInput.style.marginRight = '5px';
        hoursInput.style.textAlign = 'center';
        hoursInput.className = 'time-hours';
        
        // 分钟选择
        let minutesInput = document.createElement('input');
        minutesInput.type = 'number';
        minutesInput.min = 0;
        minutesInput.max = 59;
        minutesInput.value = this.selectedDate ? this.selectedDate.getMinutes() : 0;
        minutesInput.style.width = '40px';
        minutesInput.style.textAlign = 'center';
        minutesInput.className = 'time-minutes';
        
        // 时间变更处理
        const timeChangeHandler = () => {
            if (!this.selectedDate) {
                this.selectedDate = new Date();
            }
            
            let hours = parseInt(hoursInput.value) || 0;
            let minutes = parseInt(minutesInput.value) || 0;
            
            // 限制范围
            hours = Math.max(0, Math.min(23, hours));
            minutes = Math.max(0, Math.min(59, minutes));
            
            hoursInput.value = hours;
            minutesInput.value = minutes;
            
            this.selectedDate.setHours(hours, minutes);
            this._setInputValue(this.selectedDate);
            this._triggerChange();
        };
        
        hoursInput.addEventListener('change', timeChangeHandler);
        minutesInput.addEventListener('change', timeChangeHandler);
        
        timeContainer.appendChild(document.createTextNode('时间: '));
        timeContainer.appendChild(hoursInput);
        timeContainer.appendChild(document.createTextNode(':'));
        timeContainer.appendChild(minutesInput);
        
        container.appendChild(timeContainer);
    };
    
    // 格式化年月显示
    SimpleDatePicker.prototype._formatYearMonth = function(date) {
        return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
    };
    
    // 设置输入框的值
    SimpleDatePicker.prototype._setInputValue = function(date) {
        if (!date) return;
        
        let format = this.options.dateFormat;
        let value = format
            .replace('Y', date.getFullYear())
            .replace('m', (date.getMonth() + 1).toString().padStart(2, '0'))
            .replace('d', date.getDate().toString().padStart(2, '0'));
        
        if (this.options.enableTime) {
            value += ' ' + date.getHours().toString().padStart(2, '0') + ':' + 
                     date.getMinutes().toString().padStart(2, '0');
        }
        
        this.element.value = value;
    };
    
    // 触发onChange回调
    SimpleDatePicker.prototype._triggerChange = function() {
        if (Array.isArray(this.options.onChange)) {
            this.options.onChange.forEach(callback => {
                if (typeof callback === 'function') {
                    callback([this.selectedDate], this.element.value);
                }
            });
        } else if (typeof this.options.onChange === 'function') {
            this.options.onChange([this.selectedDate], this.element.value);
        }
    };
    
    // 设置最小日期
    SimpleDatePicker.prototype.set = function(option, value) {
        if (option === 'minDate' || option === 'maxDate') {
            this.options[option] = value;
        }
    };
    
    // 全局初始化函数
    global.simpleDatePicker = function(selector, options) {
        return new SimpleDatePicker(selector, options);
    };
    
    // 中文语言包（模拟）
    global.simpleDatePicker.l10n = {
        zh: {
            weekdays: {
                shorthand: ['日', '一', '二', '三', '四', '五', '六']
            },
            months: {
                shorthand: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
            }
        }
    };
    
})(window); 