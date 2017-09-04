import broadlink, sys, time

ip = sys.argv[1]
macaddr = sys.argv[2]
state = sys.argv[3]

try:
	device = broadlink.sp2(host=(ip,80), mac=bytearray.fromhex(macaddr))
	device.auth()
	time.sleep(3)
	device.host
	
	if state == "2":
		print device.check_power()   
	if state == "1":
		device.set_power(True)
		print "on"
	if state == "0":
		device.set_power(False)
		print "off"
except:
		print "error"
		pass
