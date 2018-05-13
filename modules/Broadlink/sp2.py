import broadlink, sys, time

ip = sys.argv[1]
macaddr = sys.argv[2]
state = sys.argv[3]


try:
        broadlink.rm(host=(ip,80), mac=bytearray.fromhex(macaddr))
        # it mean that is not a rm device
        if(state != "3"):
                device = broadlink.sp2(host=(ip,80), mac=bytearray.fromhex(macaddr))
                device.auth()
                time.sleep(3)

                # Add option to only check power without change it 
                if state == "2":
                        print device.check_power()
                elif state == "1":
                        device.set_power(True)
                        print "on"
                elif state == "0":
                        device.set_power(False)
                        print "off"
        else :
                device = broadlink.rm(host=(ip,80), mac=bytearray.fromhex(macaddr))
                device.auth()
                time.sleep(3)

                ir_value = sys.argv[4]

                if ir_value != "CheckAlive":
                        device.send_data(ir_value.decode('hex'))
                print "ok"
       
except Exception as inner:
		print "error"
		print inner
		pass
