#/usr/bin/python
import sys, os, re, socket, time, select, random, getopt
from Crypto.Cipher import AES

#
# This is @0x00string's script to control the KanKun Smartplug without a phone
# Enjoy, feel free to check out my notes and slides on building this
#
# you'll want to modify the applyConfig() function to fit your situation
#
# greets to @zenofex, @exploiteers and the KanKun G+ group
#

def banner():
    ascii_art = '''
               ___        ___   ___      _        _             _               
        ____  / _ \      / _ \ / _ \    | |      (_)           ( )              
       / __ \| | | |_  _| | | | | | |___| |_ _ __ _ _ __   __ _|/ ___           
      / / _` | | | \ \/ / | | | | | / __| __| '__| | '_ \ / _` | / __|          
     | | (_| | |_| |>  <| |_| | |_| \__ \ |_| |  | | | | | (_| | \__ \          
  _  _\ \__,_|\___//_/\_\\\\___/ \___/|___/\__|_|  |_|_| |_|\__, | |___/          
 | |/ /\____/    | |/ /           / ____|          | |     __/ | | | |          
 | ' / __ _ _ __ | ' /_   _ _ __ | |     ___  _ __ | |_ _ |___/_ | | | ___ _ __ 
 |  < / _` | '_ \|  <| | | | '_ \| |    / _ \| '_ \| __| '__/ _ \| | |/ _ \ '__|
 | . \ (_| | | | | . \ |_| | | | | |___| (_) | | | | |_| | | (_) | | |  __/ |   
 |_|\_\__,_|_| |_|_|\_\__,_|_| |_|\_____\___/|_| |_|\__|_|  \___/|_|_|\___|_|   
                                                                                                                                                          
'''
    print(ascii_art)

def applyConfig():
    ##
    # you can change these to your liking
    ##
    global IFACE
    IFACE = "wlan0"
    #global RHOST
    #RHOST = "192.168.1.16"
    #global RMAC
    #RMAC = "00:15:61:bc:41:ff"
    global PASSWORD
    PASSWORD = "nopassword"
    global NAME
    NAME = "lan_phone"
    global VERBOSE
    VERBOSE = False
    global SSID
    SSID = "pina"
    global WLANKEY
    WLANKEY = "pineapplekey"
    global INITPASS
    INITPASS = "nopassword"
    global DEVNAME
    DEVNAME = "name"
    ##
    # you'll likely not want to change these
    ##
    global KEY
    KEY = "fdsl;mewrjope456fds4fbvfnjwaugfo"
    global RPORT
    RPORT = 27431
    global SOCKET_TIMEOUT
    SOCKET_TIMEOUT = 1
    global RECV_BUF
    RECV_BUF = 1024
    return 0

def stdout (t, m):
        if (t is "+"):
                print "\x1b[32;1m[+]\x1b[0m\t" + m + "\n",
        elif (t is "-"):
                print "\x1b[31;1m[-]\x1b[0m\t" + m + "\n",
        elif (t is "*"):
                print "\x1b[34;1m[*]\x1b[0m\t" + m + "\n",
        elif (t is "!"):
                print "\x1b[33;1m[!]\x1b[0m\t" + m + "\n",


def createDump (input):
        d, b, h = '', [], []
        u = list(input)
        for e in u:
                h.append(e.encode("hex"))
                if e == '0x0':
                        b.append('0')
                elif 30 > ord(e) or ord(e) > 128:
                        b.append('.')
                elif 30 < ord(e) or ord(e) < 128:
                        b.append(e)
        i = 0
        while i < len(h):
                if (len(h) - i ) >= 16:
                        d += ' '.join(h[i:i+16])
                        d += "         "
                        d += ' '.join(b[i:i+16])
                        d += "\n"
                        i = i + 16
                else:
                        d += ' '.join(h[i:(len(h) - 1)])
                        pad = len(' '.join(h[i:(len(h) - 1)]))
                        d += ' ' * (56 - pad)
                        d += ' '.join(b[i:(len(h) - 1)])
                        d += "\n"
                        i = i + len(h)
        return d


def crypto(switch, input):
    k = AES.new(KEY, AES.MODE_ECB)
    if input is not None:
        if switch == "e":
            return k.encrypt(input)
        elif switch == "d":
            return k.decrypt(input)


class sockobj:
    def __init__(self, s=None, proto="udp"):
        if s is None:
            if proto == "udp":
                self.s = socket.socket(
                    socket.AF_INET, socket.SOCK_DGRAM)
            elif proto == "tcp":
                self.s = socket.socket(
                    socket.AF_INET, socket.SOCK_STREAM)
            self.s.settimeout(SOCKET_TIMEOUT)
        else:
            self.s = s
    def connect(self, rhost, rport):
        self.s.connect((rhost,rport))
    def tx(self,m):
        self.s.send(crypto("e",m))
    def rx(self):
        try:
            m = self.s.recv(RECV_BUF)
            return crypto("d",m)
        except:
            return ""


def txrx(ip,port,m,s):
        if s is None:
                sock = sockobj()
        else:
                sock = sockobj(None, "tcp")
        sock.connect(ip,port)
        sock.tx(m)
        ret = sock.rx()
        if ret is not "":
                return ret
        else:
                stdout("!","Nothing returned...")


def getPacket(t, e=None, on_time="2015-02-10-11:11:11", off_time="2015-02-10-11:11:11", enabled="n", open_enabled="n", close_enabled="n", timer_id=None):
        d,c = "%",""
        auth = NAME + d + RMAC + d + PASSWORD + d
        if t == "open":
                c = auth + "open" + d + "request"
        elif t == "check":
                c = auth + "check" + d + "request"
        elif t == "brmode":
                c = auth + "check" + d + "brmode" 
        elif t == "close":
                c = auth + "close" + d + "request"
        elif t == "total timer":
                c = auth + "check#total" + d + "timer"
        elif t == "check timer":
                c = auth + "check#" + e + "%timer"
        elif t == "heart":
                c = auth + os.popen('date +%y-%m-%d-%T').read().rstrip() + d + "heart"
        elif t == "confirm":
                c = auth + "confirm#"+ e + d + "request"
        elif t == "confirm timer":
                c = auth + "confirm#"+ e + d + "timer"
        elif t == "set timer":
                c = auth + "alarm#" + str(random.randint(100,999)) + "#" + enabled + "#" + on_time + "#" + open_enabled + "#" + off_time + "#" + close_enabled +"#" + e + "#set" + d + "timer" + d + "timer"
        elif t == "unset timer":
                c = auth + "alarm#" + timer_id + "#" + enabled + "#" + on_time + "#" + open_enabled + "#" + off_time + "#" + close_enabled + "#" + e + "#unset" + d + "timer" + d + "timer"
        elif t == "wifi config":
                c = "phone" + d + SSID + d + WLANKEY + d + INITPASS + d + DEVNAME + d + "GMT" + os.popen('date +%z').read().rstrip()
        while len(c) % 16 is not 0:
                c = c + "\x00"
        return c


def isConfirm(m):
    q = re.compile('.*?(\d\d\d\d\d).*?')
    p = q.search(m)
    if p is not None:
        return p.group(1)
    else:
        return None


def isHack(m):
    q = re.compile('.*?(hack).*?')
    p = q.search(m)
    if p is not None:
        return p.group(1)
    else:
        return None


def isCheck(m):
    q = re.compile('.*?%.*?%.*?%(.*?)%rack.*?')
    p = q.search(m)
    if p is not None:
        return p.group(1)
    else:
        return None


def isTotalTimer(m):
    q = re.compile('.*?\%.*?\%.*?\%check#(.*?)#.*?')
    p = q.search(m)
    if p is not None:
        return p.group(1)
    else:
        return None


def isTimerStatus(m):
    q = re.compile('.*?%.*?%.*?%alarm#(.*?)#(.)#(.*?)#(.)#(.*?)#(.)#(.*?)#(.)tack.*?')
    p = q.search(m)
    if p is not None:
        return p
    else:
        return None


def parseRet(m):
    ret = isConfirm(m)
    is_confirm = ret
    if is_confirm is not None:
        stdout("*","confirmation number: " + is_confirm)
        ret = None
        return is_confirm
    ret = isHack(m)
    if ret is not None:
        stdout("*","Heartbeat ackowledged")
        ret = None
        return None
    ret = isCheck(m)
    if ret is not None:
        stdout("*","switch is: " + ret)
        ret = None
        return None
    ret = isTotalTimer(m)
    if ret is not None:
        stdout("*","There are currently " + str(ret) + " timers set")
        ret = None
        return None
    ret = isTimerStatus(m)
    if ret is not None:
        stdout("timer ID " + id + "\nopen time: " + ret.group(3) + "\nclose time: " + ret.group(5) + "\ny1y2y3: " + ret.group(2) + ret.group(4) + ret.group(6) + "\ndays repeated: " + ret.group(7) + "\nenabled: " + ret.group(8))
        return ret


def setRMAC():
    RMAC = os.popen("arp -i" + IFACE + " " + RHOST + " | awk {'print $4'}").read().strip()


def sendOp(op, e=None,ont=None,offt=None,y1=None,y2=None,y3=None, tid=None):
        switch = None
        if op == "set timer" or op == "unset timer":
                m = getPacket(op, e, ont, offt, y1,y2,y3, tid)
        elif op == "open" or op == "close":
                m = getPacket(op)
        elif op == "wifi config":
                global RHOST
                RHOST = "192.168.10.253"
                global RPORT
                RPORT = 37092
                switch = 1
                m = getPacket(op, e, ont, y1, y2)
	else:
		m = getPacket(op)
        ret = None
        stdout("*","Sending " + op + " packet...")
        if VERBOSE is not False:
                stdout("*","\n" + createDump(m))
        ret = txrx(RHOST, RPORT, m, switch)
        if ret is not None:
                stdout("+","received reply packet...")
                if VERBOSE is not False:
                        stdout("*","\n" + createDump(ret))
                parsed = parseRet(ret)
                if parsed is not None:
                        if op is "set timer" or op is "unset timer":
                                m = getPacket("confirm timer", parsed)
                        else:
                                m = getPacket("confirm", parsed)
                        stdout("*","sending confirmation #: " + str(parsed))
                        if VERBOSE is not False:
                                stdout("*","\n" + createDump(m))
                        ret = None
                        ret = txrx(RHOST,RPORT,m,switch)
                        if ret is not None:
                                stdout("*","received reply packet...")
                                if VERBOSE is not False:
                                    stdout("*","\n" + createDump(ret))
                                parsed = parseRet(ret)


def passwordJack():
    key = AES.new(KEY, AES.MODE_ECB, )
    s = socket(AF_INET, SOCK_DGRAM)
    s.bind(('', 27431))
    s.setblocking(0)
    p = re.compile('(.*?)%(.*?)%(.*?).*?')
    while True:
        ret = select.select([s],[],[])
        m = ret[0][0].recv(1024)
        if VERBOSE is not False:
            stdout("+","\n" + key.decrypt(m))
        q = p.search(m)
        if q is not None:
            stdout("+","Got possible credentials: name: " + q.group(1) + " mac: " + q.group(2) + " password: " + q.group(3))

def heartbeat():
    sendOp("heart")

def check():
    sendOp("check")

def checkBRMode():
    sendOp("brmode")

def totalTimer():
    sendOp("total timer")

def checkTimer(num):
    sendOp("check timer", num)

def setTimer(start,stop,enabled,onenable,offenable,repeatstr):
    sendOp("set timer", repeatstr,start,stop,enabled,onenable,offenable)

def unsetTimer(num):
    timer_info = sendOp("check timer", num, "r")
    sendOp("set timer", timer_info[0],timer_info[1],timer_info[2],timer_info[3],timer_info[4],timer_info[5],timer_info[6])

def wifiConfig(ssid,key,initpass="nopassword",devname="name"):
    global SSID
    SSID = ssid
    global WLANKEY
    WLANKEY = key
    global INITPASS
    INITPASS = initpass
    global DEVNAME
    DEVNAME = devname
    sendOp("wifi config",SSID,WLANKEY)

def on():
    sendOp("open")

def off():
    sendOp("close")

def usage():
    banner()
    usage_text = '''


Usage:  script.py -a on

    make sure to vi this script and set the IP to that of your target

    arguments:
        required:
        -a, --action    <action name> what action to perform, e.g., -a heart
        actions: on, off, heart, check, brmode, totalTimer, checkTimer, setTimer, unsetTimer, wifiConfig

        optional:
        -v              verbose output

        actions that take additional arguments:

            unsetTimer
                script.py -a unsetTimer --num 3

                --num           a number, this is an argument required for checkTimer and unsetTimer actions


            setTimer
                script.py -a setTimer --start-time "`date +%y-%m-%d-%T`" --stop-time "2015-02-10-11:22:22" --enabled y [...] --repeatstr "1,2,3"

                --start-time    <date +%y-%m-%d-%T> this is a date-string
                --stop-time     ditto
                --enabled       <y|n> timer enabled?
                --on-enabled    <y|n> on-time enabled?
                --off-enabled   <y|n> off-time enabled?
                --repeatstr     <1,2,4,5,6,7>, setTimer argument, repeat on which days?


            wifiConfig
                script.py -a wifiConfig --ssid Linksys --key "P@ssw0rd!"

                --ssid          <string>, the ssid of the network to join the device to
                --key           <string>, the key for the network to join the device to
                --initial-password <string>, the password to set for the device (default is "noPASSWORD")
                --device-name   <string>, the name to give the device (this doesnt always take and changes with the wind)

'''
    print(usage_text)

def main():
    if applyConfig() > 0:
        usage()
        exit(1)
    action = None
    options, remainder = getopt.getopt(sys.argv[1:], 'a:vh', ['action=','verbose','num=','start-time=','stop-time=','enabled=','on-enabled=','off-enabled=','repeatstr=','ssid=','key=','initial-password=','device-name=','ip=','mac=','help'])

    #my code to enable reuse in script to diffrence sockets
    # Example for use python kkeps_controller.py -a off ip=192.168.1.16 mac=00:15:61:bc:41:ff
    for arg in remainder:
        opt = arg.split('=')
        if opt[0] == 'ip':
            global RHOST
            RHOST = opt[1]
            print 'ip:' + RHOST
        elif opt[0] == 'mac':
            global RMAC
            RMAC = opt[1]
            print 'mac:' + RMAC
        

    for opt, arg in options:
        if opt in ('-h', '--help'):
            usage()
            exit()
        elif opt in ('-a', '--action'):
            action = arg
        elif opt in ('-v', '--verbose'):
            global VERBOSE
            VERBOSE = True
        elif opt in ('num'):
            num = arg
        elif opt in ('start-time'):
            start_time = arg
        elif opt in ('stop-time'):
            stop_time = arg
        elif opt in ('enabled'):
            enabled = arg
        elif opt in ('on-enabled'):
            onenable = arg
        elif opt in ('off-enabled'):
            offenable = arg
        elif opt in ('repeatstr'):
            repeatstr = arg
        elif opt in ('ssid'):
            global SSID
            SSID = arg
        elif opt in ('key'):
            global WLANKEY
            WLANKEY = arg
        elif opt in ('initial-password'):
            global INITPASS
            INITPASS = arg
        elif opt in ('device-name'):
            global DEVNAME
            DEVNAME = arg
        
    if action == None:
        usage()
        exit(1)
    elif action == "heart":
        heartbeat()
    elif action == "check":
        check()
    elif action == "on":
        on()
    elif action == "off":
        off()
    elif action == "brmode":
        checkBRMode()
    elif action == "totalTimer":
        totalTimer()
    elif action == "checkTimer":
        checkTimer(num)
    elif action == "setTimer":
        setTimer(start_time,stop_time,enabled,onenable,offenable,repeatstr)
    elif action == "unsetTimer":
        unsetTimer(num)
    elif action == "wifiConfig":
        wifiConfig(SSID,WLANKEY,INITPASS,DEVNAME)
    else:
        usage()
        exit(1)


if __name__ == "__main__":
    main()
