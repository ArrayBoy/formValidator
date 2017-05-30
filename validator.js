//策略对象
//校验逻辑都封装成策略对象
var strategies = {
    //非空
    isNonEmpty: function(value, errorMsg) {
        value = value.replace(/\s+/g, "");
        if (value === '') {
            return errorMsg;
        }
    },
    //最小长度
    minLength: function(value, length, errorMsg) {
        //value = value.replace(/[^\x00-\xff]/g,"01").length;
        if (value.length < length) {
            return errorMsg;
        }
    },
    //最大长度
    maxLength: function(value, length, errorMsg) {
        if (value.length > length) {
            return errorMsg;
        }
    },
    //手机号码格式
    isMobile: function(value, errorMsg) {
        if (!/(^1[3|5|8][0-9]{9}$)/.test(value)) {
            return errorMsg;
        }
    },
    //邮件格式
    isEmail: function(value, errorMsg) {
        if (!/^\w+([+-.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value)) {
            return errorMsg;
        }
    },
    //只能是数字
    isNumber: function(value, errorMsg) {
        if (!/^[0-9]*$/.test(value)) {
            return errorMsg;
        }
    },
    //是否相等
    isEqual: function(value1, value2, errorMsg) {
        if (value1 !== value2) {
            return errorMsg;
        }
    }
};

//Validator 类
//Validator类在这里作为Context，负责接收用户的请求并委托给strategy对象。
var Validator = function() {
    // 保存校验规则
    this.cache = [];
};

Validator.prototype.add = function(dom, rules) {
    var self = this;
    for (var i = 0, rule; rule = rules[i++];) {
        (function(rule) {
            // 把strategy和参数分开
            var strategyAry = rule.strategy.split(':');
            var errorMsg = rule.errorMsg;
            // 把校验的步骤用空函数包装起来，并且放入cache
            self.cache.push(function() {
                // 用户挑选的strategy
                var strategy = strategyAry.shift();
                // 把input的value添加进参数列表
                strategyAry.unshift(dom.value);
                // 把errorMsg添加进参数列表
                strategyAry.push(errorMsg);
                return strategies[strategy].apply(dom, strategyAry);
            });
        })(rule)
    }
};

Validator.prototype.start = function() {
    for (var i = 0, validatorFunc; validatorFunc = this.cache[i++];) {
        // 开始校验，并取得校验后的返回信息
        var errorMsg = validatorFunc();
        // 如果有确切的返回值，说明校验没有通过
        if (errorMsg) {
            return errorMsg;
        }
    }
};


//调用代码
var registerForm = document.getElementById('registerForm');
var validataFunc = function() {
    var validator = new Validator();
    validator.add(registerForm.userName, [{
        strategy: 'isNonEmpty',
        errorMsg: '用户名不能为空！'
    }, {
        strategy: 'minLength:6',
        errorMsg: '用户名长度不能小于6位！'
    },{
        strategy: 'maxLength:12',
        errorMsg: '用户名长度不能大于12位！'
    }]);

    validator.add(registerForm.passWord, [{
        strategy: 'isNonEmpty',
        errorMsg: '密码不能为空！'
    }, {
        strategy: 'minLength:6',
        errorMsg: '密码长度不能小于6位！'
    },{
        strategy: 'isNumber',
        errorMsg: '密码只能为数字！'
    }]);

    validator.add(registerForm.repassWord, [{
        strategy: 'isEqual:'+registerForm.passWord.value+'',
        errorMsg: '两次密码不一致!'
    }]);

    validator.add(registerForm.phoneNumber, [{
        strategy: 'isNonEmpty',
        errorMsg: '手机号码不能为空！'
    }, {
        strategy: 'isMobile',
        errorMsg: '手机号码格式不正确！'
    }]);

    validator.add(registerForm.emailAddress, [{
        strategy: 'isNonEmpty',
        errorMsg: '邮箱地址不能为空！'
    }, {
        strategy: 'isEmail',
        errorMsg: '邮箱地址格式不正确！'
    }]);

    var errorMsg = validator.start();
    return errorMsg;
}

registerForm.onsubmit = function(e) {
    e = e || window.event;
    var errorMsg = validataFunc();
    if (errorMsg) {
        document.getElementById('warn').innerText = errorMsg;
        e.preventDefault();
    }
};

