import broadlink, sys, time

ip = sys.argv[1]
macaddr = sys.argv[2]
state = sys.argv[3]

try:
	device = broadlink.sp2(host=(ip,80), mac=bytearray.fromhex(macaddr))
	device.auth()
	time.sleep(3)
	device.host

	# Add option to only check power without change it 
	if state == "2":
		print device.check_power()   
	elif state == "1":
		device.set_power(True)
		print "on"
	elif state == "0":
		device.set_power(False)
		print "off"
except:
		print "error"
		pass
