arr = [4, 2, 8, 17, 12, 9, 15, 10]
def bubbleSort(arr):
    temp = 0
    swap = True
    while swap == True:
        swap = False
        for i in range(len(arr) - 1):
            if arr[i] > arr[i + 1]:
                temp = arr[i]
                arr[i] = arr[i + 1]
                arr [i + 1] = temp
                swap = True
    return arr
def linearSearch(item):
    found = False
    for i in range(len(arr)):
        if arr[i] == item:
            found = True
    if found == True:
        print("Item found")
    else:
        print ("Item not found")
def binarySearch(item, arr):
    lower = 0
    upper = len(arr)
    if item > lower - (upper/2):
        lower = upper - (upper/2)