// 使用 策略模式实现表单验证
// 一个完整的策略模式要有两个类，一个是策略类，一个是环境类(主要类)，环境类接收请求，但不处理请求，它会把请求委托给策略类，让策略类去处理，而策略类的扩展是很容易的，这样，使得我们的代码易于扩展
// 在表单验证的例子中，各种验证的方法组成了策略类，比如：判断是否为空的方法(如：isNonEmpty)，判断最小长度的方法(如：minLength)，判断是否为手机号的方法(isMoblie)等等，他们组成了策略类，供给环境类去委托请求

/*客户端调用代码*/
/*策略对象*/
const strategies = {
    isNonEmpty(value, errorMsg) {
        return value === '' ?
            errorMsg : void 0
    },
    minLength(value, length, errorMsg) {
        return value.length < length ?
            errorMsg : void 0
    },
    isMoblie(value, errorMsg) {
        return !/^1(3|5|7|8|9)[0-9]{9}$/.test(value) ?
            errorMsg : void 0
    },
    isEmail(value, errorMsg) {
        return !/^\w+([+-.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(value) ?
            errorMsg : void 0
    }
}

/*Validator类*/
class Validator {
    constructor() {
        this.cache = [] //保存校验规则
    }
    add(dom, rules) {
        for (let rule of rules) {
            let strategyAry = rule.strategy.split(':') //例如['minLength',6]
            let errorMsg = rule.errorMsg //'用户名不能为空'
            this.cache.push(() => {
                let strategy = strategyAry.shift() //用户挑选的strategy
                strategyAry.unshift(dom.value) //把input的value添加进参数列表
                strategyAry.push(errorMsg) //把errorMsg添加进参数列表，[dom.value,6,errorMsg]
                return strategies[strategy].apply(dom, strategyAry)
            })
        }
    }
    start() {
        for (let validatorFunc of this.cache) {
            let errorMsg = validatorFunc() //开始校验，并取得校验后的返回信息
            if (errorMsg) { //r如果有确切返回值，说明校验没有通过
                return errorMsg
            }
        }
    }
}

let registerForm = document.querySelector('#registerForm')
const validatorFunc = () => {
    let validator = new Validator()

    validator.add(registerForm.userName, [{
        strategy: 'isNonEmpty',
        errorMsg: '用户名不能为空！'
    }, {
        strategy: 'minLength:6',
        errorMsg: '用户名长度不能小于6位！'
    }])

    validator.add(registerForm.passWord, [{
        strategy: 'isNonEmpty',
        errorMsg: '密码不能为空！'
    }, {
        strategy: 'minLength:6',
        errorMsg: '密码长度不能小于6位！'
    }])

    validator.add(registerForm.phoneNumber, [{
        strategy: 'isNonEmpty',
        errorMsg: '手机号码不能为空！'
    }, {
        strategy: 'isMoblie',
        errorMsg: '手机号码格式不正确！'
    }])

    validator.add(registerForm.emailAddress, [{
        strategy: 'isNonEmpty',
        errorMsg: '邮箱地址不能为空！'
    }, {
        strategy: 'isEmail',
        errorMsg: '邮箱地址格式不正确！'
    }])
    let errorMsg = validator.start()
    return errorMsg
}

registerForm.addEventListener('submit', function(e) {
    let errorMsg = validatorFunc()
    if (errorMsg) {
        alert(errorMsg);
        e.preventDefault();
    }
}, false);
