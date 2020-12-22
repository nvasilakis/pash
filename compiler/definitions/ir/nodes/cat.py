from definitions.ir.dfg_node import *
from definitions.input_consumption_mode import *

class Cat(DFGNode):
    def __init__(self, inputs, outputs, com_name, com_category, input_consumption_mode = InputConsumptionMode.ORDERED,
                 com_options = [], com_redirs = [], com_assignments=[]):
        assert(str(com_name) == "cat")
        assert(com_category == "stateless")
        assert(input_consumption_mode == InputConsumptionMode.ORDERED)
        super().__init__(inputs, outputs, com_name, com_category,
                         input_consumption_mode=input_consumption_mode,
                         com_options=com_options, 
                         com_redirs=com_redirs, 
                         com_assignments=com_assignments)

def make_cat_node(inputs, output):
    com_name = Arg(string_to_argument("cat"))
    com_category = "stateless"
    return Cat(inputs,
               [output],
               com_name, 
               com_category)
