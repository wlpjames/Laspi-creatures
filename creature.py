import sys
import random
import copy
import datetime
import json
import psycopg2
from flask import jsonify



class brain:
    #input = two times anteniNum plus one for hunger;
    def __init__(self, inpt, output):
        self.bias = 1
        self.ident = 0
        self.inputs = inpt
        self.hidLayers = 0
        self.out = output
        self.structure = []
        self.weights = []
        self.mass = 0


        #possables
        self.chanceOfMut = 25 #out of 100
        self.sizeOfMut = 0.1
        self.generation = 0

    def __str__(self):
        return str(self.__class__) + " : " + str(self.__dict__)

    def spawn(self):
        self.structure = self.randStruct()
        self.weights = self.newWeights()
        self.saveToDB()
        return

    def randStruct(self):
        # creates random brain structure
        self.hidLayers = random.randint(1, 5)
        arr = [self.hidLayers, self.inputs]
        for c in range(self.hidLayers):
            arr = arr + [random.randint(4, 10)]
        arr += [self.out]
        return arr

    def newWeights(self):
        #weights generates random values in 3d matrix
        matrix = []
        layer = []
        wgt = []
        for i in range(0, self.structure[0] + 1):
            # plus 1 for output layer
            layer = []
            for j in range(0, self.structure[i + 2]):
                wgt = []
                for k in range(0, self.structure[i + 1] + self.bias):
                    wgt += [random.uniform(-0.5, 0.5)]
                layer += [wgt]
            matrix += [layer]
        return matrix

    def load(self, ID):
        #todo
        #fetch from DB
        string = "SELECT * FROM creatures WHERE ID = " + str(ID) + ";"
        data = fetchFromDB(string)
        #print(data)
        #print("data printed above")


        #parse database
        self.ident = data[0][0]
        self.structure = json.loads(data[0][2])
        self.weights = json.loads(data[0][3])
        self.generation = data[0][7]
        self.findMass()

        return

    def saveToDB(self):
        print()
        #convert data to json
        jsonStructure = json.dumps(self.structure)
        jsonWeights = json.dumps(self.weights)

        string = "INSERT INTO creatures (structure, weights, generation) \
VALUES ('" + jsonStructure + "' , '" + jsonWeights + "' ," + str(self.generation) + "RETURNING id);"
        #print(string)

        self.ident = sendToDB(string)
        print("new id")
        print(self.ident)

        return

    def mutate(self):
        self.mutateVals()
        self.mutateStruct()
        self.mutateChances()
        #self.saveToDB() is being saved elsewhere
        return

    def mutateVals(self):
        #chance of mutation = ?
        coin = 100
        #iterate through matrix struct = [1, 2, 2, 2]
        #print(self.structure[0])
        for i in range(0, self.structure[0] + 1):
            for j in range(0, self.structure[i+2]):
                for k in range(0, self.structure[i+1] + self.bias):
                    #mutate each weight
                    if random.randint(0, coin) < self.chanceOfMut:
                        self.weights[i][j][k] += random.uniform(self.sizeOfMut  * -1, self.sizeOfMut)#random num

        print ("matrix_mutated!")
        return

    def mutateStruct(self):
        #gives chance of creating new layer
        for i in range(0, self.structure[0]):
            #chance to create new node
            coin = 1000
            flip = random.uniform(0, coin)
            #add node
            if flip < 1:

                #modify the structure array
                self.structure[i+2]+=1

                #add array of weights to end of Layer
                self.weights[i].append([]) # adds array of length last row;

                for j in range(0, self.structure[i+1] + self.bias): #in range of last layer
                    #add weights from this node, to last
                    #use insert instead on appens to leave bias at the end
                    self.weights[i][self.structure[i+2]-1].insert(self.weights[i][self.structure[i+2]-1].len() - 2,0)

                for j in range(0, self.structure[i+3]): #inrange of current layer
                    #append a zero to each array
                    #use insert instead on appens to leave bias at the end
                    self.weights[i+1][j].insert(self.weights[i+1][j].len() - 2 , 0)

            elif flip > coin - 1 and self.structure[i+2] > 1:

                #which node gets deleated
                coin = self.structure[i+2] - 1
                flip = random.randint(0, coin)

                #modify the structure array
                self.structure[i+2]-=1

                #deletes conections from this node to last
                self.weights[i].pop(flip) #gets popped

                #deletes conections to this node from next
                for j in range(0, self.structure[i+3]):
                    self.weights[i+1][j].pop(flip) # gets popped


            #chance to create new layer after this layer, if is wanted

        return

    def mutateChances(self):
        #mutate chances of mutation
        self.chanceOfMut += random.uniform(0.01, -0.01)# do something about these magic numbers
        self.sizeOfMut += random.uniform(0.001, -0.001)

    def findMass(self):
        #todo
        #
        #amount of nodes, through looking at structure
        #conectedness, through looking at value of weights? totaled?
        #
        #num of connections
        total = 0
        for i in range(0, self.structure[0] + 1):
            total += self.structure[i+2] * self.structure[i+1]

        #value of conections / total of all values in weights
        #?????
        self.mass = total / 10
        return

def request_brain(inputs, outputs):
    newBrain = brain(inputs, outputs)
    newBrain.spawn()
    newBrain.findMass()
    return makeArray(newBrain)

def request_child(parentIdent):

    arr = []
    #load brain and mutate it
    newBrain = brain(0,0)
    newBrain.load(parentIdent)
    #print("oldident")
    #print(parentIdent)
    newBrain.mutate()
    newBrain.findMass
    newBrain.saveToDB()
    #need to find new indent
    return makeArray(newBrain)

def makeArray(brain):
    ##apend structure, weights and ident to array to be sent to the responses
    arr = []
    arr.append(brain.structure)
    arr.append(brain.weights)
    arr.append(brain.ident)
    arr.append(brain.mass)
    arr.append(brain.generation)
    #print("brain in data - " + str(brain.ident))
    return arr


def fetchFromDB(message):
    #takes a string from the database and returns what the database gives.

    # cursor
    conn_string = "postgres://lxlameafsxcwnd:d0f2f7f2a3b0110169d6237dd40097000cdadcef849ef2a719246a46658e6658@ec2-54-217-205-90.eu-west-1.compute.amazonaws.com:5432/d5iu3re523ghb0"
    connection = psycopg2.connect(conn_string)
    cursor = connection.cursor()
    cursor.execute(message)
    #print("this is the rowcount")
    #print(cursor.rowcount)
    rows = cursor.fetchall()
    #print(rows)

    # close the connection
    connection.close()
    return rows

def sendToDB(message):
    # cursor
    conn_string = "postgres://lxlameafsxcwnd:d0f2f7f2a3b0110169d6237dd40097000cdadcef849ef2a719246a46658e6658@ec2-54-217-205-90.eu-west-1.compute.amazonaws.com:5432/d5iu3re523ghb0"
    connection = psycopg2.connect(conn_string)
    cursor = connection.cursor()
    id = cursor.execute(message)
    connection.commit()

    #find id / primary key
    #id = cursor.lastrowid
    #id = cursor.fetchone()[0]
    rows = cursor.fetchall()
    print("ID = " + str(rows)) # im wary that ids could get confused if there are many conections at the same time using the same DB

    # close the connection
    connection.close()

    return rows[0][0]



