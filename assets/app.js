const surnames = [
  '王',
  '李',
  '张',
  '刘',
  '陈',
  '杨',
  '赵',
  '黄',
  '周',
  '吴',
  '徐',
  '孙',
  '胡',
  '朱',
  '高',
  '林',
  '何',
  '郭',
  '马',
  '罗',
  '梁',
  '宋',
  '郑',
  '谢',
  '韩',
  '唐',
  '冯',
  '于',
  '董',
  '程',
  '曹',
  '袁',
  '邓',
  '许',
  '沈',
  '曾',
  '彭',
  '吕',
  '蒋',
  '蔡'
]

const givenNames = [
  '一诺',
  '亦辰',
  '若曦',
  '子涵',
  '明轩',
  '雨桐',
  '思源',
  '知夏',
  '安然',
  '景行',
  '清和',
  '书瑶',
  '沐阳',
  '云舒',
  '嘉宁',
  '星野',
  '言蹊',
  '乐知',
  '予白',
  '南乔',
  '承宇',
  '念初',
  '庭川',
  '以宁'
]

const mobilePrefixes = ['130', '131', '132', '133', '135', '137', '138', '155', '170', '176', '187', '189']
const regionCodes = ['110101', '310101', '440106', '330106', '320102', '510104', '420106', '610102']
const profileCard = document.querySelector('.profile-card')
const fields = {
  profileId: document.querySelector('#profile-id'),
  avatar: document.querySelector('#avatar'),
  name: document.querySelector('#name'),
  birthday: document.querySelector('#birthday'),
  phone: document.querySelector('#phone'),
  idCard: document.querySelector('#id-card'),
  bankCard: document.querySelector('#bank-card'),
  status: document.querySelector('#copy-status')
}

const copyLabels = {
  name: '姓名',
  birthday: '出生日期',
  phoneNumber: '手机号码',
  idCardNumber: '身份证号',
  bankCardNumber: '银行卡号'
}

let currentProfile = null
let sequence = 1
let statusTimer = 0

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(list) {
  return list[randomInt(0, list.length - 1)]
}

function pad(value) {
  return String(value).padStart(2, '0')
}

function generateName() {
  return `${pick(surnames)}${pick(givenNames)}`
}

function generateBirthday() {
  const year = randomInt(1984, 2004)
  const month = randomInt(1, 12)
  const day = randomInt(1, new Date(year, month, 0).getDate())
  return `${year}-${pad(month)}-${pad(day)}`
}

function generateMobile() {
  let phone = pick(mobilePrefixes)
  for (let index = 0; index < 8; index += 1) {
    phone += randomInt(0, 9)
  }
  return phone
}

function calculateIdCardChecksum(prefix) {
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checksums = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  const sum = prefix.split('').reduce((total, digit, index) => total + Number(digit) * weights[index], 0)
  return checksums[sum % 11]
}

function generateIdCard(birthday) {
  const region = pick(regionCodes)
  const birthPart = birthday.replaceAll('-', '')
  const sequenceCode = String(randomInt(1, 999)).padStart(3, '0')
  const prefix = `${region}${birthPart}${sequenceCode}`
  return `${prefix}${calculateIdCardChecksum(prefix)}`
}

function calculateLuhnCheckDigit(number) {
  const sum = number
    .split('')
    .reverse()
    .reduce((total, digit, index) => {
      let value = Number(digit)
      if (index % 2 === 0) {
        value *= 2
        if (value > 9) value -= 9
      }
      return total + value
    }, 0)
  return String((10 - (sum % 10)) % 10)
}

function generateBankCard() {
  const prefix = '622848'
  const length = Math.random() < 0.5 ? 16 : 19
  let base = prefix
  while (base.length < length - 1) {
    base += randomInt(0, 9)
  }
  return `${base}${calculateLuhnCheckDigit(base)}`
}

function createProfile() {
  const birthday = generateBirthday()
  return {
    name: generateName(),
    birthday,
    phoneNumber: generateMobile(),
    idCardNumber: generateIdCard(birthday),
    bankCardNumber: generateBankCard()
  }
}

function renderProfile(profile) {
  fields.profileId.textContent = `#${String(sequence).padStart(4, '0')}`
  fields.avatar.textContent = profile.name.slice(0, 1)
  fields.name.textContent = profile.name
  fields.birthday.textContent = profile.birthday
  fields.phone.textContent = profile.phoneNumber
  fields.idCard.textContent = profile.idCardNumber
  fields.bankCard.textContent = profile.bankCardNumber
}

function generateProfile() {
  currentProfile = createProfile()
  renderProfile(currentProfile)
  sequence += 1

  profileCard.classList.remove('is-refreshing')
  window.requestAnimationFrame(() => {
    profileCard.classList.add('is-refreshing')
  })
}

function setStatus(message) {
  window.clearTimeout(statusTimer)
  fields.status.textContent = message
  statusTimer = window.setTimeout(() => {
    fields.status.textContent = ''
  }, 1800)
}

async function copyProfile() {
  if (!currentProfile) return
  await copyText(JSON.stringify(currentProfile, null, 2), 'JSON')
}

async function copyText(text, label) {
  try {
    await navigator.clipboard.writeText(text)
    setStatus(`已复制${label}`)
  } catch (error) {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    setStatus(`已复制${label}`)
  }
}

function copyField(fieldName) {
  if (!currentProfile || !currentProfile[fieldName]) return
  copyText(currentProfile[fieldName], copyLabels[fieldName] || '字段')
}

document.querySelector('#generate-button').addEventListener('click', generateProfile)
document.querySelector('#copy-button').addEventListener('click', copyProfile)
document.querySelectorAll('[data-copy-field]').forEach((button) => {
  button.addEventListener('click', () => copyField(button.dataset.copyField))
})
generateProfile()
