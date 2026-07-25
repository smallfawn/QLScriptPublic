'use strict';

const got = require('got');
require('dotenv').config();
const { readFile } = require('fs/promises');
const path = require('path');
const fs = require('fs');
const tokenFileList = ['/ql/data/db/keyv.sqlite', '/ql/data/config/auth.json', '/ql/config/auth.json'];
let authFile = getLatestFile(tokenFileList);
const HOSTS = ['http://127.0.0.1:5600','http://127.0.0.1:5700'];
function api(options){
  const req = got.extend({prefixUrl: HOSTS[0],retry:{limit:0},timeout:{request:5000}})(options);
  ['json','text','buffer'].forEach(m=>{
    const orig=req[m].bind(req);
    req[m]=()=>orig().catch(e=>['ECONNREFUSED','ETIMEDOUT'].includes(e.code)?got.extend({prefixUrl:HOSTS[1],retry:{limit:0},timeout:{request:5000}})(options)[m]():Promise.reject(e));
  });
  return req;
}
function getLatestFile(files) {
    let latestFile = null;
    let latestMtime = 0;
    for (const file of files) {
        try {
            const stats = fs.statSync(file);
            const mtime = stats.mtimeMs;
            if (mtime > latestMtime) {
                latestMtime = mtime;
                latestFile = file;
            }
        } catch (e) {
        }
    }
    return latestFile;
}
async function getToken() {
    const authConfig = await readFile(authFile);
    // console.log(authConfig.toString().match(/"token":"(.*?)",/)[1])
    return authConfig.toString().match(/"token":"([^"]*)"(?!.*"token":)/)[1];
}
// getToken()
module.exports.getEnvs = async () => {
    const token = await getToken();
    const body = await api({
        url: 'api/envs',
        searchParams: {
            searchValue: 'JD_COOKIE',
            t: Date.now(),
        },
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
    }).json();
    return body.data;
};

module.exports.getEnvsCount = async () => {
    const data = await this.getEnvs();
    return data.length;
};

module.exports.addEnv = async (cookie, remarks) => {
    const token = await getToken();
    const body = await api({
        method: 'post',
        url: 'api/envs',
        params: { t: Date.now() },
        json: [{
            name: 'JD_COOKIE',
            value: cookie,
            remarks,
        }],
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

module.exports.updateEnv = async (cookie, eid, remarks) => {
    const token = await getToken();
    const body = await api({
        method: 'put',
        url: 'api/envs',
        params: { t: Date.now() },
        json: {
            name: 'JD_COOKIE',
            value: cookie,
            _id: eid,
            remarks,
        },
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

module.exports.updateEnv11 = async (cookie, eid, remarks) => {
    const token = await getToken();
    const body = await api({
        method: 'put',
        url: 'api/envs',
        params: { t: Date.now() },
        json: {
            name: 'JD_COOKIE',
            value: cookie,
            id: eid,
            remarks,
        },
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

module.exports.DisableCk = async (eid) => {
    const token = await getToken();
    const body = await api({
        method: 'put',
        url: 'api/envs/disable',
        params: { t: Date.now() },
        body: JSON.stringify([eid]),
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

module.exports.EnableCk = async (eid) => {
    const token = await getToken();
    const body = await api({
        method: 'put',
        url: 'api/envs/enable',
        params: { t: Date.now() },
        body: JSON.stringify([eid]),
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};

module.exports.getstatus = async (eid) => {
    const envs = await this.getEnvs();
    var tempid = 0;
    for (let i = 0; i < envs.length; i++) {
        tempid = 0;
        if (envs[i]._id) {
            tempid = envs[i]._id;
        }
        if (envs[i].id) {
            tempid = envs[i].id;
        }
        if (tempid == eid) {
            return envs[i].status;
        }
    }
    return 99;
};

module.exports.getEnvById = async (eid) => {
    const envs = await this.getEnvs();
    var tempid = 0;
    for (let i = 0; i < envs.length; i++) {
        tempid = 0;
        if (envs[i]._id) {
            tempid = envs[i]._id;
        }
        if (envs[i].id) {
            tempid = envs[i].id;
        }
        if (tempid == eid) {
            return envs[i].value;
        }
    }
    return "";
};

module.exports.getEnvByPtPin = async (Ptpin) => {
    const envs = await this.getEnvs();
    for (let i = 0; i < envs.length; i++) {
        var tempptpin = decodeURIComponent(envs[i].value.match(/pt_pin=([^; ]+)(?=;?)/) && envs[i].value.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
        if (tempptpin == Ptpin) {
            return envs[i];
        }
    }
    return "";
};

module.exports.delEnv = async (eid) => {
    const token = await getToken();
    const body = await api({
        method: 'delete',
        url: 'api/envs',
        params: { t: Date.now() },
        body: JSON.stringify([eid]),
        headers: {
            Accept: 'application/json',
            authorization: `Bearer ${token}`,
            'Content-Type': 'application/json;charset=UTF-8',
        },
    }).json();
    return body;
};