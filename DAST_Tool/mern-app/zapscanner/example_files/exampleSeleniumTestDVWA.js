// Generated by Selenium IDE
const { Builder, By, Key, until } = require('selenium-webdriver')
const assert = require('assert')

describe('dvwaLogin', function() {
  this.timeout(30000)
  let driver
  let vars
  beforeEach(async function() {
    driver = await new Builder().forBrowser('chrome').build()
    vars = {}
  })
  afterEach(async function() {
    await driver.quit();
  })
  it('dvwaLogin', async function() {
    await driver.get("http://192.168.0.171:80/login.php") 
    await driver.manage().window().setRect(1453, 759)
    await driver.findElement(By.name("username")).click()
    await driver.findElement(By.name("username")).sendKeys("admin")
    await driver.findElement(By.name("password")).sendKeys("password")
    await driver.findElement(By.name("Login")).click()
    await driver.findElement(By.linkText("CSP Bypass")).click()
  })
})
