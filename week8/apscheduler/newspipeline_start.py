import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'common'))
import newspipeline_scheduler_client as client

client.scheduleNewsPipeLine()
#client.removeNewsPipeLine()
#client.printJobs()