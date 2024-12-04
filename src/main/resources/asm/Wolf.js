var asmapi = Java.type('net.minecraftforge.coremod.api.ASMAPI')
var opc = Java.type('org.objectweb.asm.Opcodes')
var AbstractInsnNode = Java.type('org.objectweb.asm.tree.AbstractInsnNode')
var Label = Java.type('org.objectweb.asm.tree.LabelNode')
var FieldInsnNode = Java.type('org.objectweb.asm.tree.FieldInsnNode')
var JumpInsnNode = Java.type('org.objectweb.asm.tree.JumpInsnNode')
var TypeInsnNode = Java.type('org.objectweb.asm.tree.TypeInsnNode')
var InsnNode = Java.type('org.objectweb.asm.tree.InsnNode')

function initializeCoreMod() {
    return {
    	'Wolf': {
    		'target': {
    			'type': 'CLASS',
    			'name': 'net.minecraft.entity.passive.WolfEntity'
    		},
    		'transformer': function(classNode) {
    			var count = 0
    			var fn = asmapi.mapMethod('func_70037_a') // readAdditional
    			for (var i = 0; i < classNode.methods.size(); ++i) {
    				var obj = classNode.methods.get(i)
    				if (obj.name == fn) {
    					patch_func_70037_a(obj)
    					count++
    				}
    			}
    			if (count < 1)
    				asmapi.log("ERROR", "Failed to modify WolfEntity: Method not found")
    			return classNode;
    		}
    	}
    }
}

// add the test: if (!(this.world instanceof ServerWorld)) return;
function patch_func_70037_a(obj) {
	var f1 = asmapi.mapField('field_70170_p') // world
	var n1 = "net/minecraft/world/server/ServerWorld"
	var node = asmapi.findFirstInstruction(obj, opc.CHECKCAST)
	if (node && node.desc == n1) {
		var node2 = node.getPrevious()
		if (node2 && node2.getOpcode() == opc.GETFIELD && node2.name == f1)
		{
			var op5 = new Label()
			var op1 = new InsnNode(opc.DUP)
			var op2 = new TypeInsnNode(opc.INSTANCEOF, n1)
			var op3 = new JumpInsnNode(opc.IFNE, op5)
			var op4 = new InsnNode(opc.RETURN)
			var list = asmapi.listOf(op1, op2, op3, op4, op5)
			obj.instructions.insert(node2, list)
		}
		else
			asmapi.log("ERROR", "Failed to modify WolfEntity: GETFIELD not found")
	}
	else
		asmapi.log("ERROR", "Failed to modify WolfEntity: CHECKCAST not found")
}
