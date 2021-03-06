
/** @module Accounts */

import bcrypt from 'bcrypt-promise'
import sqlite from 'sqlite-async'

const saltRounds = 10

/**
 * Accounts
 * ES6 module that handles registering accounts and logging in.
 */
class Accounts {
	/**
   * Create an account object
   * @param {String} [dbName=":memory:"] - The name of the database file to use.
   */
	constructor(dbName = ':memory:') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS users\
				(id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, pass TEXT, email TEXT,\
surveysDone TEXT, survey1Score TEXT);'
			await this.db.run(sql)
			return this
		})()
	}

	/**
	 * registers a new user
	 * @param {String} user the chosen username
	 * @param {String} pass the chosen password
	 * @param {String} email the chosen email
	 * @returns {Boolean} returns true if the new user has been added
	 */
	async register(user, pass, email) {
		Array.from(arguments).forEach( val => {
			if(val.length === 0) throw new Error('missing field')
		})
		let sql = `SELECT COUNT(id) as records FROM users WHERE user="${user}";`
		const data = await this.db.get(sql)
		if(data.records !== 0) throw new Error(`username "${user}" already in use`)
		sql = `SELECT COUNT(id) as records FROM users WHERE email="${email}";`
		const emails = await this.db.get(sql)
		if(emails.records !== 0) throw new Error(`email address "${email}" is already in use`)
		pass = await bcrypt.hash(pass, saltRounds)
		const surveysDone = -1
		const surveysScore = -1
		sql = `INSERT INTO users(user, pass, email, surveysDone, survey1Score) VALUES("${user}", "${pass}", "${email}",\
"${surveysDone}", ${surveysScore})`
		await this.db.run(sql)
		return true
	}

	/**
	 * checks to see if a set of login credentials are valid
	 * @param {String} username the username to check
	 * @param {String} password the password to check
	 * @returns {Boolean} returns true if credentials are valid
	 */
	async login(username, password) {
		let sql = `SELECT count(id) AS count FROM users WHERE user="${username}";`
		const records = await this.db.get(sql)
		if(!records.count) throw new Error(`username "${username}" not found`)
		sql = `SELECT pass FROM users WHERE user = "${username}";`
		const record = await this.db.get(sql)
		const valid = await bcrypt.compare(password, record.pass)
		if(valid === false) throw new Error(`invalid password for account "${username}"`)
		return true
	}
	/**
	 * returns a list of survey completed (referenced by ID's)
	 * @param {String} username the username to check
	 * @returns {Array} returns array of surveys completed
	 */
	async getSurveysDone(username) {
 		let sql = `SELECT count(id) AS count FROM users WHERE user="${username}";`
		let records = await this.db.get(sql)
		if(!records.count) throw new Error(`username "${username}" not found`)
		sql = `SELECT surveysDone FROM users WHERE user = "${username}";`
		records = await this.db.get(sql)
		records = records.surveysDone
		if(records === '-1') return [-1]
		return records.split(',')
	}
	/**
	 * returns the score of a survey completed
	 * @param {String} username the username to check
	 * @param {Number} id of survey we want the score for
	 * @returns {Number} returns score of said survey
	 */
	async getSurveyScore(username, surveyID) {
		const surveysDone = await this.getSurveysDone(username)
		console.log(surveysDone)
		if(!surveysDone.includes(String(surveyID)) || surveysDone[0] === -1) {
			throw new Error(`survey "${surveyID}" has not been completed`)
		}
		const sql = `SELECT survey${ String(surveyID) }Score FROM users WHERE user = "${username}";`
		const records = await this.db.get(sql)
		return Number(records.survey1Score)
	}

	async close() {
		await this.db.close()
	}
}

export default Accounts
