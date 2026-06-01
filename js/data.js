/* ============================================
   数据结构知识内容数据
   基于《数据结构课程·学习需求分析报告》
   ============================================ */

const DS_DATA = {
  modules: [
    // ==================== 模块1: 线性结构 ====================
    {
      id: 'linear',
      title: '线性结构',
      icon: '📊',
      topics: [
        {
          id: 'seq-list',
          title: '顺序表（数组）',
          difficulty: 2,
          concept: `
            <p>顺序表是用<strong>一段连续的内存空间</strong>依次存储数据元素的线性结构。在大多数编程语言中，数组就是顺序表的典型实现。</p>
            <p>核心特点：<strong>支持随机访问</strong>（O(1)时间通过下标访问任意元素），但插入和删除需要移动大量元素（O(n)）。</p>
          `,
          keyPoints: [
            '逻辑上相邻的元素在物理存储上也相邻',
            '通过下标 O(1) 随机访问',
            '插入/删除需要移动元素，平均 O(n)',
            '需要预先分配固定容量（静态数组）或动态扩容',
          ],
          commonErrors: [
            { desc: '忘记检查容量边界，导致数组越界', tag: 'error' },
            { desc: '插入/删除时元素移动方向错误', tag: 'error' },
            { desc: '下标混淆——从0还是从1开始？', tag: 'warning' },
            { desc: '动态扩容时忘记更新容量变量', tag: 'warning' },
          ],
          comparison: '与链表相比：顺序表随机访问快，但插入删除慢；内存连续，Cache友好。',
          codeExamples: {
            cpp: `// 顺序表插入操作（在位置i插入元素x）
void insert(int arr[], int& n, int i, int x) {
    if (n >= MAX_SIZE) return;  // 检查容量
    if (i < 0 || i > n) return; // 检查边界
    // 从后往前移动元素
    for (int j = n; j > i; j--) {
        arr[j] = arr[j - 1];
    }
    arr[i] = x;
    n++;
}`,
            python: `# 顺序表插入操作（Python list）
def insert(arr, i, x):
    if i < 0 or i > len(arr):
        return
    arr.insert(i, x)  # Python 内置方法
    # 手动实现：
    # arr.append(None)
    # for j in range(len(arr)-1, i, -1):
    #     arr[j] = arr[j-1]
    # arr[i] = x`
          },
          complexity: { time: '访问 O(1) | 插入/删除 O(n) | 查找 O(n)', space: 'O(n)' }
        },
        {
          id: 'singly-linked-list',
          title: '单链表',
          difficulty: 3,
          concept: `
            <p>单链表通过<strong>指针</strong>将零散的节点串联起来。每个节点包含<strong>数据域</strong>和指向下一个节点的<strong>指针域</strong>。</p>
            <p>核心特点：不需要连续内存空间，插入删除 O(1)，但无法随机访问（查找 O(n)）。</p>
          `,
          keyPoints: [
            '每个节点 = 数据 + 指向下一节点的指针',
            '头指针是整个链表的唯一入口',
            '插入/删除只需修改指针指向（O(1)），但需先找到位置（O(n)）',
            '注意区分"头指针"和"头结点"——头结点是不存数据的辅助节点',
          ],
          commonErrors: [
            { desc: '插入时先连新节点还是先断旧链？顺序错误导致断链', tag: 'error' },
            { desc: '删除节点后忘记释放内存（C/C++），造成内存泄漏', tag: 'error' },
            { desc: '操作空链表时未判断，导致空指针异常', tag: 'error' },
            { desc: '遍历时忘记移动指针 p = p->next，导致死循环', tag: 'warning' },
          ],
          comparison: 'vs 双链表：单链表只有一个方向，无法直接访问前驱；但节省一个指针空间。',
          codeExamples: {
            cpp: `// 单链表节点定义 & 头插法
struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

// 头插法插入新节点
void insertAtHead(ListNode*& head, int val) {
    ListNode* newNode = new ListNode(val);
    newNode->next = head;  // ①新节点指向原头节点
    head = newNode;        // ②更新头指针
}

// 删除指定节点（需找到前驱）
void deleteNode(ListNode*& head, int val) {
    if (!head) return;
    if (head->val == val) {  // 删除头节点
        ListNode* tmp = head;
        head = head->next;
        delete tmp;
        return;
    }
    ListNode* p = head;
    while (p->next && p->next->val != val) p = p->next;
    if (p->next) {
        ListNode* tmp = p->next;
        p->next = p->next->next;
        delete tmp;
    }
}`,
            python: `# 单链表节点定义 & 操作
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def insert_at_head(head, val):
    """头插法"""
    new_node = ListNode(val)
    new_node.next = head
    return new_node  # 返回新的头节点

def delete_node(head, val):
    """删除值为val的节点"""
    if not head:
        return None
    if head.val == val:
        return head.next  # Python GC 自动回收
    p = head
    while p.next and p.next.val != val:
        p = p.next
    if p.next:
        p.next = p.next.next
    return head`
          },
          complexity: { time: '插入/删除 O(1) | 查找 O(n) | 不支持随机访问', space: 'O(n)（额外指针空间）' }
        },
        {
          id: 'doubly-linked-list',
          title: '双链表',
          difficulty: 3,
          concept: `
            <p>双链表每个节点有<strong>两个指针</strong>：一个指向前驱（prev），一个指向后继（next）。</p>
            <p>优点是可以<strong>双向遍历</strong>，删除节点时不需要找前驱（O(1)直接删除）。代价是每个节点多存一个指针。</p>
          `,
          keyPoints: [
            '每个节点：prev 指针 + 数据 + next 指针',
            '插入/删除需要修改 4 个指针（前后各两个）',
            '删除给定节点 p 时，直接通过 p->prev 找到前驱，不需要从头遍历',
            '可以双向遍历，方便某些场景（如浏览器前进后退）',
          ],
          commonErrors: [
            { desc: '插入时四个指针的修改顺序容易搞混，漏改某个指针', tag: 'error' },
            { desc: '操作首尾节点时忘记判断边界（prev==null 或 next==null）', tag: 'error' },
            { desc: '只改了后继的prev，忘记改前驱的next', tag: 'warning' },
          ],
          codeExamples: {
            cpp: `// 双链表节点
struct DListNode {
    int val;
    DListNode *prev, *next;
    DListNode(int x) : val(x), prev(nullptr), next(nullptr) {}
};

// 在节点p之后插入节点x
void insertAfter(DListNode* p, int val) {
    DListNode* x = new DListNode(val);
    x->next = p->next;   // ①
    x->prev = p;         // ②
    if (p->next)         // ③ 注意边界！
        p->next->prev = x;
    p->next = x;         // ④
}

// 删除节点p
void deleteNode(DListNode* p) {
    if (!p) return;
    if (p->prev) p->prev->next = p->next;  // 前驱的后继
    if (p->next) p->next->prev = p->prev;  // 后继的前驱
    delete p;
}`,
            python: `class DListNode:
    def __init__(self, val=0, prev=None, next=None):
        self.val = val
        self.prev = prev
        self.next = next

def insert_after(p, val):
    """在p之后插入"""
    x = DListNode(val)
    x.next = p.next
    x.prev = p
    if p.next:
        p.next.prev = x
    p.next = x

def delete_node(p):
    """删除节点p"""
    if not p:
        return
    if p.prev:
        p.prev.next = p.next
    if p.next:
        p.next.prev = p.prev`
          },
          complexity: { time: '插入/删除 O(1) | 查找 O(n)', space: 'O(n)（每个节点多一个prev指针）' }
        },
        {
          id: 'circular-list',
          title: '循环链表',
          difficulty: 3,
          concept: `
            <p>循环链表的<strong>尾节点的next指向头节点</strong>，形成一个环。循环双链表的头节点prev也指向尾节点。</p>
            <p>优点：从任意节点出发都能遍历整个链表，适合环形队列、约瑟夫环等场景。</p>
          `,
          keyPoints: [
            '尾节点 next → 头节点（单向循环）',
            '头节点 prev → 尾节点（双向循环）',
            '循环终止条件：p != head（而非 p != nullptr）',
            '判断空表：head->next == head（带头结点时）',
          ],
          commonErrors: [
            { desc: '遍历循环链表时用了 p != nullptr 做终止条件，导致死循环', tag: 'error' },
            { desc: '判断空表的条件与普通链表不同，容易写错', tag: 'warning' },
          ],
          codeExamples: {
            cpp: `// 循环单链表遍历
void traverse(ListNode* head) {
    if (!head) return;
    ListNode* p = head;
    do {
        cout << p->val << " ";
        p = p->next;
    } while (p != head);  // 回到起点则停止
}`,
            python: `# 循环单链表遍历
def traverse(head):
    if not head:
        return
    p = head
    while True:
        print(p.val, end=' ')
        p = p.next
        if p == head:  # 回到起点
            break`
          },
          complexity: { time: '同单/双链表', space: '同单/双链表' }
        },
        {
          id: 'stack',
          title: '栈（Stack）',
          difficulty: 3,
          concept: `
            <p>栈是一种<strong>后进先出（LIFO）</strong>的线性结构，只能在一端（栈顶）进行插入和删除。</p>
            <p>就像一摞盘子：最后放上去的，最先被拿走。栈有两种实现方式：<strong>顺序栈</strong>（数组实现）和<strong>链栈</strong>（链表实现）。</p>
          `,
          keyPoints: [
            'LIFO：Last In, First Out',
            '基本操作：push（入栈）、pop（出栈）、top/peek（取栈顶）',
            '顺序栈：用数组 + top指针（指向栈顶元素或下一位置）',
            '链栈：用链表实现，栈顶 = 链表头（头插头删，O(1)）',
          ],
          commonErrors: [
            { desc: '顺序栈空栈/满栈判断条件搞错', tag: 'error' },
            { desc: 'top指针含义混淆：指向栈顶元素 vs 指向下一空位置', tag: 'warning' },
            { desc: '链栈入栈/出栈的指针操作与链表不同', tag: 'warning' },
          ],
          comparison: '顺序栈 vs 链栈：顺序栈容量有限但实现简单；链栈无容量限制但每节点有指针开销。',
          codeExamples: {
            cpp: `// 顺序栈实现
class SeqStack {
    int data[MAX_SIZE];
    int top;  // top指向栈顶元素位置，-1表示空栈
public:
    SeqStack() : top(-1) {}
    bool isEmpty() { return top == -1; }
    bool isFull()  { return top == MAX_SIZE - 1; }
    bool push(int x) {
        if (isFull()) return false;
        data[++top] = x;
        return true;
    }
    bool pop(int& x) {
        if (isEmpty()) return false;
        x = data[top--];
        return true;
    }
    int peek() { return isEmpty() ? -1 : data[top]; }
};`,
            python: `class SeqStack:
    def __init__(self, max_size=100):
        self.data = [0] * max_size
        self.top = -1  # -1表示空栈
        self.max_size = max_size

    def is_empty(self):
        return self.top == -1

    def is_full(self):
        return self.top == self.max_size - 1

    def push(self, x):
        if self.is_full():
            return False
        self.top += 1
        self.data[self.top] = x
        return True

    def pop(self):
        if self.is_empty():
            return None
        x = self.data[self.top]
        self.top -= 1
        return x

    def peek(self):
        return None if self.is_empty() else self.data[self.top]`
          },
          complexity: { time: 'push/pop/peek 均为 O(1)', space: 'O(n)' }
        },
        {
          id: 'queue',
          title: '队列（Queue）',
          difficulty: 3,
          concept: `
            <p>队列是一种<strong>先进先出（FIFO）</strong>的线性结构，在一端（队尾）插入，另一端（队头）删除。</p>
            <p>就像排队买票：先来的先服务。关键问题是<strong>假溢出</strong>——用<strong>循环队列</strong>解决。</p>
          `,
          keyPoints: [
            'FIFO：First In, First Out',
            '基本操作：enqueue/push（入队）、dequeue/pop（出队）、front（取队头）',
            '顺序队列的问题：经过多次入队出队后，front之前的位置无法再利用（假溢出）',
            '循环队列：用取模运算让队列首尾相连，(rear+1)%maxsize 判断队满',
          ],
          commonErrors: [
            { desc: '循环队列判空判满条件搞混：front==rear 到底是空还是满？', tag: 'error' },
            { desc: '取模运算 (rear+1)%maxsize 写错', tag: 'error' },
            { desc: '忘记更新front和rear的值', tag: 'warning' },
            { desc: '元素个数计算：(rear-front+maxsize)%maxsize', tag: 'warning' },
          ],
          comparison: '循环队列牺牲一个存储单元来区分空和满，也可以额外用一个size变量来记录元素个数。',
          codeExamples: {
            cpp: `// 循环队列实现
class CirQueue {
    int data[MAX_SIZE];
    int front, rear;
public:
    CirQueue() : front(0), rear(0) {}
    bool isEmpty() { return front == rear; }
    // 牺牲一个位置，当(rear+1)%maxsize == front时队满
    bool isFull()  { return (rear + 1) % MAX_SIZE == front; }
    int size()     { return (rear - front + MAX_SIZE) % MAX_SIZE; }

    bool enqueue(int x) {
        if (isFull()) return false;
        data[rear] = x;
        rear = (rear + 1) % MAX_SIZE;
        return true;
    }
    bool dequeue(int& x) {
        if (isEmpty()) return false;
        x = data[front];
        front = (front + 1) % MAX_SIZE;
        return true;
    }
};`,
            python: `class CirQueue:
    def __init__(self, max_size=100):
        self.data = [0] * max_size
        self.front = 0
        self.rear = 0
        self.max_size = max_size

    def is_empty(self):
        return self.front == self.rear

    def is_full(self):
        return (self.rear + 1) % self.max_size == self.front

    def size(self):
        return (self.rear - self.front + self.max_size) % self.max_size

    def enqueue(self, x):
        if self.is_full():
            return False
        self.data[self.rear] = x
        self.rear = (self.rear + 1) % self.max_size
        return True

    def dequeue(self):
        if self.is_empty():
            return None
        x = self.data[self.front]
        self.front = (self.front + 1) % self.max_size
        return x`
          },
          complexity: { time: 'enqueue/dequeue/front 均为 O(1)', space: 'O(n)' }
        },
        {
          id: 'stack-queue-app',
          title: '栈与队列应用场景',
          difficulty: 2,
          concept: `
            <p>栈和队列不只是抽象概念，在实际开发中有大量应用场景。</p>
          `,
          keyPoints: [
            '栈：函数调用栈、括号匹配、表达式求值（中缀→后缀）、撤销操作（Undo）、迷宫回溯',
            '队列：BFS最短路径、任务调度、消息队列、打印队列、缓冲区',
            '双栈模拟队列：用两个栈实现FIFO效果（经典面试题）',
            '单调栈/单调队列：解决"下一个更大元素""滑动窗口最大值"等高频问题',
          ],
          commonErrors: [
            { desc: '表达式求值时运算符优先级处理出错', tag: 'warning' },
            { desc: '括号匹配时忘记考虑多种括号（()[]{}）的对应关系', tag: 'error' },
          ],
          codeExamples: {
            cpp: `// 括号匹配 - 栈的经典应用
bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) return false;
            char top = st.top();
            if ((c == ')' && top != '(') ||
                (c == ']' && top != '[') ||
                (c == '}' && top != '{'))
                return false;
            st.pop();
        }
    }
    return st.empty();
}`,
            python: `# 括号匹配
def is_valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in '([{':
            stack.append(c)
        else:
            if not stack or stack[-1] != pairs[c]:
                return False
            stack.pop()
    return len(stack) == 0`
          },
          complexity: { time: '括号匹配 O(n)', space: 'O(n)' }
        }
      ]
    },

    // ==================== 模块2: 树形结构 ====================
    {
      id: 'tree',
      title: '树形结构',
      icon: '🌳',
      topics: [
        {
          id: 'binary-tree',
          title: '二叉树',
          difficulty: 3,
          concept: `
            <p>二叉树是每个节点<strong>最多有两个子节点</strong>的树形结构，分别称为左子节点和右子节点。</p>
            <p><strong>满二叉树</strong>：每层节点数都达到最大值（第k层有2^(k-1)个节点）。<strong>完全二叉树</strong>：只有最下面两层节点度数可以小于2，且叶子节点靠左排列。</p>
          `,
          keyPoints: [
            '二叉树第i层最多有 2^(i-1) 个节点',
            '深度为k的二叉树最多有 2^k - 1 个节点',
            'n个节点的二叉树有 n+1 个空指针域',
            '遍历方式：前序（根左右）、中序（左根右）、后序（左右根）、层序（BFS）',
          ],
          commonErrors: [
            { desc: '前序/中序/后序遍历搞混——"前中后"指的是根节点的访问顺序', tag: 'error' },
            { desc: '递归遍历时忘记递归出口条件，导致栈溢出', tag: 'error' },
            { desc: '非递归遍历时栈操作顺序写反', tag: 'warning' },
          ],
          codeExamples: {
            cpp: `// 二叉树节点 & 三种递归遍历
struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

void preOrder(TreeNode* root) {   // 前序：根→左→右
    if (!root) return;
    cout << root->val << " ";
    preOrder(root->left);
    preOrder(root->right);
}

void inOrder(TreeNode* root) {    // 中序：左→根→右
    if (!root) return;
    inOrder(root->left);
    cout << root->val << " ";
    inOrder(root->right);
}

void postOrder(TreeNode* root) {  // 后序：左→右→根
    if (!root) return;
    postOrder(root->left);
    postOrder(root->right);
    cout << root->val << " ";
}`,
            python: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def pre_order(root):    # 前序
    if not root:
        return
    print(root.val, end=' ')
    pre_order(root.left)
    pre_order(root.right)

def in_order(root):     # 中序
    if not root:
        return
    in_order(root.left)
    print(root.val, end=' ')
    in_order(root.right)

def post_order(root):   # 后序
    if not root:
        return
    post_order(root.left)
    post_order(root.right)
    print(root.val, end=' ')`
          },
          complexity: { time: '遍历 O(n)', space: '递归栈 O(h)，h为树高' }
        },
        {
          id: 'bst',
          title: '二叉搜索树（BST）',
          difficulty: 4,
          concept: `
            <p>BST是一种特殊的二叉树，对于任意节点：<strong>左子树所有节点值 < 根节点值 < 右子树所有节点值</strong>。</p>
            <p>核心优势：查找、插入、删除的平均时间复杂度为 <strong>O(log n)</strong>（平衡时），最坏 O(n)（退化成链）。</p>
          `,
          keyPoints: [
            '中序遍历BST = 有序序列（递增）',
            '插入：从根开始比较，小于往左，大于往右，直到找到空位置',
            '删除分三种情况：①叶子节点直接删 ②单子节点用子节点替代 ③双子节点找前驱/后继替代',
            '删除双子节点时，用左子树最大值（前驱）或右子树最小值（后继）替换',
          ],
          commonErrors: [
            { desc: '删除双子节点时，选错替代节点（前驱 or 后继？两者都可以，但实现要一致）', tag: 'error' },
            { desc: '删除根节点时忘记更新根指针', tag: 'error' },
            { desc: 'BST未做平衡，在有序插入时退化成链表，O(n)查找', tag: 'warning' },
          ],
          codeExamples: {
            cpp: `// BST 插入和查找
TreeNode* insertBST(TreeNode* root, int val) {
    if (!root) return new TreeNode(val);
    if (val < root->val)
        root->left = insertBST(root->left, val);
    else if (val > root->val)
        root->right = insertBST(root->right, val);
    return root;
}

TreeNode* searchBST(TreeNode* root, int val) {
    if (!root || root->val == val) return root;
    return val < root->val
        ? searchBST(root->left, val)
        : searchBST(root->right, val);
}`,
            python: `def insert_bst(root, val):
    if not root:
        return TreeNode(val)
    if val < root.val:
        root.left = insert_bst(root.left, val)
    elif val > root.val:
        root.right = insert_bst(root.right, val)
    return root

def search_bst(root, val):
    if not root or root.val == val:
        return root
    if val < root.val:
        return search_bst(root.left, val)
    return search_bst(root.right, val)`
          },
          complexity: { time: '平均 O(log n) | 最坏 O(n)', space: 'O(h) 递归栈' }
        },
        {
          id: 'avl',
          title: '平衡二叉树（AVL）',
          difficulty: 5,
          concept: `
            <p>AVL树是一种<strong>自平衡</strong>的二叉搜索树。任意节点左右子树高度差（<strong>平衡因子</strong>）的绝对值不超过1。</p>
            <p>当插入/删除破坏平衡时，通过<strong>旋转</strong>操作恢复：LL（单右旋）、RR（单左旋）、LR（左旋+右旋）、RL（右旋+左旋）。</p>
          `,
          keyPoints: [
            '平衡因子 = 左子树高度 - 右子树高度，取值为{-1, 0, 1}',
            'LL型：在左子树的左子树上插入 → 右旋',
            'RR型：在右子树的右子树上插入 → 左旋',
            'LR型：在左子树的右子树上插入 → 先左旋左子树，再右旋根',
            'RL型：在右子树的左子树上插入 → 先右旋右子树，再左旋根',
          ],
          commonErrors: [
            { desc: '旋转类型判断错误——LL/RR/LR/RL的区分依据是"失衡节点→插入路径"', tag: 'error' },
            { desc: '旋转后忘记更新节点的高度', tag: 'error' },
            { desc: '插入后只检查了局部平衡，未逐层向上检查', tag: 'warning' },
          ],
          codeExamples: {
            cpp: `// AVL：获取高度 & 右旋
int height(TreeNode* node) {
    return node ? node->height : 0;
}
int getBalance(TreeNode* node) {
    return node ? height(node->left) - height(node->right) : 0;
}

TreeNode* rightRotate(TreeNode* y) {
    TreeNode* x = y->left;
    TreeNode* T2 = x->right;
    x->right = y;       // 旋转
    y->left = T2;
    y->height = max(height(y->left), height(y->right)) + 1;
    x->height = max(height(x->left), height(x->right)) + 1;
    return x;           // 返回新根
}`,
            python: `def height(node):
    return node.height if node else 0

def get_balance(node):
    if not node:
        return 0
    return height(node.left) - height(node.right)

def right_rotate(y):
    x = y.left
    T2 = x.right
    x.right = y         # 旋转
    y.left = T2
    y.height = max(height(y.left), height(y.right)) + 1
    x.height = max(height(x.left), height(x.right)) + 1
    return x            # 返回新根`
          },
          complexity: { time: '查找/插入/删除 均为 O(log n)', space: 'O(n)' }
        },
        {
          id: 'heap',
          title: '堆（Heap）',
          difficulty: 4,
          concept: `
            <p>堆是一种特殊的<strong>完全二叉树</strong>。<strong>大顶堆</strong>：每个节点值 ≥ 子节点值。<strong>小顶堆</strong>：每个节点值 ≤ 子节点值。</p>
            <p>堆通常用<strong>数组</strong>存储（利用完全二叉树的性质）。主要用于优先队列和堆排序。</p>
          `,
          keyPoints: [
            '数组存储：节点i的左子 = 2i+1，右子 = 2i+2，父 = (i-1)/2',
            '插入：放到末尾，然后向上调整（上浮）',
            '删除堆顶：用最后一个元素替代堆顶，然后向下调整（下沉）',
            '建堆：从最后一个非叶子节点 (n/2-1) 开始，逐一下沉，O(n)时间',
          ],
          commonErrors: [
            { desc: '建堆时从哪个节点开始？——最后一个非叶子节点 n/2-1，不是 n/2', tag: 'error' },
            { desc: '大顶堆 vs 小顶堆的调整方向搞反', tag: 'error' },
            { desc: '堆排序时忘记每次取堆顶后需要重新下沉调整', tag: 'warning' },
          ],
          codeExamples: {
            cpp: `// 大顶堆：向下调整（下沉）
void heapify(int arr[], int n, int i) {
    int largest = i;
    int left = 2 * i + 1;
    int right = 2 * i + 2;

    if (left < n && arr[left] > arr[largest])
        largest = left;
    if (right < n && arr[right] > arr[largest])
        largest = right;

    if (largest != i) {
        swap(arr[i], arr[largest]);
        heapify(arr, n, largest);  // 递归调整子树
    }
}

// 建堆
void buildHeap(int arr[], int n) {
    for (int i = n/2 - 1; i >= 0; i--)
        heapify(arr, n, i);
}`,
            python: `# 大顶堆：向下调整
def heapify(arr, n, i):
    largest = i
    left = 2 * i + 1
    right = 2 * i + 2

    if left < n and arr[left] > arr[largest]:
        largest = left
    if right < n and arr[right] > arr[largest]:
        largest = right

    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        heapify(arr, n, largest)

def build_heap(arr):
    n = len(arr)
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)`
          },
          complexity: { time: '建堆 O(n) | 插入/删除 O(log n) | 取堆顶 O(1)', space: 'O(n)' }
        },
        {
          id: 'huffman',
          title: '哈夫曼树',
          difficulty: 3,
          concept: `
            <p>哈夫曼树是一种<strong>带权路径长度最短</strong>的二叉树，也称为最优二叉树。</p>
            <p>核心思想：<strong>权值越大的节点离根越近</strong>。用于数据压缩（哈夫曼编码），出现频率高的字符用短编码。</p>
          `,
          keyPoints: [
            'WPL（带权路径长度）= Σ(权值 × 路径长度)，哈夫曼树使WPL最小',
            '建树过程：每次选两个权值最小的节点合并为新节点，用优先队列实现',
            '哈夫曼编码是前缀编码——没有任何一个编码是另一个的前缀',
            '总编码长度 = WPL',
          ],
          commonErrors: [
            { desc: 'WPL计算方法混淆：所有叶子节点的权值 × 到根的边数之和', tag: 'warning' },
            { desc: '哈夫曼树不唯一（相同权值时选择顺序不同），但WPL唯一', tag: 'info' },
          ],
          codeExamples: {
            cpp: `// 使用优先队列构建哈夫曼树，计算WPL
int huffmanWPL(vector<int>& weights) {
    priority_queue<int, vector<int>, greater<int>> pq;
    for (int w : weights) pq.push(w);

    int wpl = 0;
    while (pq.size() > 1) {
        int a = pq.top(); pq.pop();
        int b = pq.top(); pq.pop();
        wpl += a + b;       // 这等价于WPL
        pq.push(a + b);     // 合并后放回
    }
    return wpl;
}`,
            python: `import heapq

def huffman_wpl(weights):
    heap = weights.copy()
    heapq.heapify(heap)
    wpl = 0
    while len(heap) > 1:
        a = heapq.heappop(heap)
        b = heapq.heappop(heap)
        wpl += a + b
        heapq.heappush(heap, a + b)
    return wpl`
          },
          complexity: { time: '建树 O(n log n)（使用优先队列）', space: 'O(n)' }
        }
      ]
    },

    // ==================== 模块3: 图形结构 ====================
    {
      id: 'graph',
      title: '图形结构',
      icon: '🕸️',
      topics: [
        {
          id: 'graph-storage',
          title: '图的存储',
          difficulty: 3,
          concept: `
            <p>图由<strong>顶点集合V</strong>和<strong>边集合E</strong>组成。两种主流存储方式各有优劣。</p>
          `,
          keyPoints: [
            '<strong>邻接矩阵</strong>：n×n二维数组，g[i][j]=1表示有边。适合稠密图，O(1)判断边，但空间O(n²)',
            '<strong>邻接表</strong>：每个顶点维护一个链表/动态数组，存其邻居。适合稀疏图，空间O(V+E)',
            '无向图：邻接矩阵对称；邻接表每条边存两次',
            '带权图：邻接矩阵存权值；邻接表节点中多加一个权值字段',
          ],
          commonErrors: [
            { desc: '无向图用邻接表时，添加边时只加了一个方向，忘记另一个方向', tag: 'error' },
            { desc: '邻接矩阵索引从0还是1开始混淆', tag: 'warning' },
          ],
          codeExamples: {
            cpp: `// 邻接表存储图
vector<int> adj[N];  // N个顶点的邻接表

void addEdge(int u, int v) {   // 无向图
    adj[u].push_back(v);
    adj[v].push_back(u);
}

// 带权图邻接表
vector<pair<int,int>> adjW[N];  // {邻居, 权值}
void addEdgeW(int u, int v, int w) {
    adjW[u].push_back({v, w});
    adjW[v].push_back({u, w});
}`,
            python: `# 邻接表存储图
from collections import defaultdict

graph = defaultdict(list)

def add_edge(u, v):  # 无向图
    graph[u].append(v)
    graph[v].append(u)

# 带权图
graph_w = defaultdict(list)

def add_edge_w(u, v, w):
    graph_w[u].append((v, w))
    graph_w[v].append((u, w))`
          },
          complexity: { time: '邻接矩阵判定边 O(1) | 邻接表遍历邻居 O(degree)', space: '邻接矩阵 O(V²) | 邻接表 O(V+E)' }
        },
        {
          id: 'graph-traversal',
          title: '图的遍历（DFS & BFS）',
          difficulty: 4,
          concept: `
            <p><strong>DFS（深度优先）</strong>：沿着一条路径走到底再回溯，用<strong>栈</strong>（递归隐式栈或显式栈）实现。</p>
            <p><strong>BFS（广度优先）</strong>：层层扩展，用<strong>队列</strong>实现，天然找到无权图最短路径。</p>
          `,
          keyPoints: [
            'DFS：递归实现最简洁；递归本质就是系统栈',
            'BFS：一定用队列，先访问离起点近的节点',
            '两者都需要 visited 标记，防止重复访问和死循环',
            'DFS适合找路径、拓扑排序、连通分量；BFS适合最短路径（无权）、层序遍历',
          ],
          commonErrors: [
            { desc: '递归DFS时忘记回溯条件，或在错误的位置标记visited', tag: 'error' },
            { desc: 'BFS在入队时标记visited（正确） vs 出队时标记（可能导致重复入队）', tag: 'warning' },
            { desc: 'BFS中队列为空才结束，非连通图需要多次BFS', tag: 'warning' },
          ],
          codeExamples: {
            cpp: `// DFS 和 BFS 实现
bool visited[N];

void dfs(int u) {
    visited[u] = true;
    cout << u << " ";
    for (int v : adj[u]) {
        if (!visited[v]) dfs(v);
    }
}

void bfs(int start) {
    queue<int> q;
    q.push(start);
    visited[start] = true;
    while (!q.empty()) {
        int u = q.front(); q.pop();
        cout << u << " ";
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;  // 入队时就标记
                q.push(v);
            }
        }
    }
}`,
            python: `from collections import deque

def dfs(graph, u, visited):
    visited.add(u)
    print(u, end=' ')
    for v in graph[u]:
        if v not in visited:
            dfs(graph, v, visited)

def bfs(graph, start):
    visited = {start}
    q = deque([start])
    while q:
        u = q.popleft()
        print(u, end=' ')
        for v in graph[u]:
            if v not in visited:
                visited.add(v)  # 入队时就标记
                q.append(v)`
          },
          complexity: { time: 'DFS/BFS 均为 O(V+E)', space: 'O(V)' }
        },
        {
          id: 'shortest-path',
          title: '最短路径',
          difficulty: 5,
          concept: `
            <p><strong>Dijkstra</strong>：单源最短路径，贪心策略，每次选当前距离起点最近的未确定节点。要求<strong>边权非负</strong>。</p>
            <p><strong>Floyd</strong>：多源最短路径，动态规划，三重循环 O(V³)。能处理负权边（但不能有负环）。</p>
          `,
          keyPoints: [
            'Dijkstra：用优先队列优化到 O((V+E)log V)；每次选dist最小的节点松弛其邻居',
            'Dijkstra不能处理负权边——因为贪心假设"一旦确定就不改变"',
            'Floyd: dp[k][i][j] = 考虑前k个节点作为中间点时，i到j的最短距离',
            'Floyd可以检测负环：dp[i][i] < 0 则存在负环',
          ],
          commonErrors: [
            { desc: 'Dijkstra处理负权边，结果错误', tag: 'error' },
            { desc: 'Dijkstra优先队列中忘记更新距离就push，导致队列中有过时数据', tag: 'warning' },
            { desc: 'Floyd三重循环顺序写错——k循环一定在最外层', tag: 'error' },
          ],
          codeExamples: {
            cpp: `// Dijkstra 优先队列优化版
typedef pair<int,int> pii;  // {距离, 节点}
const int INF = 0x3f3f3f3f;

void dijkstra(int s) {
    vector<int> dist(N, INF);
    priority_queue<pii, vector<pii>, greater<pii>> pq;
    dist[s] = 0;
    pq.push({0, s});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;  // 过时数据
        for (auto [v, w] : adjW[u]) {
            if (dist[v] > dist[u] + w) {
                dist[v] = dist[u] + w;
                pq.push({dist[v], v});
            }
        }
    }
}`,
            python: `import heapq

def dijkstra(graph, start, n):
    INF = float('inf')
    dist = [INF] * n
    dist[start] = 0
    pq = [(0, start)]  # (距离, 节点)

    while pq:
        d, u = heapq.heappop(pq)
        if d > dist[u]:
            continue  # 过时数据
        for v, w in graph[u]:
            if dist[v] > dist[u] + w:
                dist[v] = dist[u] + w
                heapq.heappush(pq, (dist[v], v))
    return dist`
          },
          complexity: { time: 'Dijkstra O((V+E)log V) | Floyd O(V³)', space: 'Dijkstra O(V) | Floyd O(V²)' }
        },
        {
          id: 'mst',
          title: '最小生成树（MST）',
          difficulty: 4,
          concept: `
            <p>最小生成树是连接图中所有顶点的<strong>边权和最小</strong>的无环子图。两大经典算法：</p>
            <p><strong>Prim</strong>：从任意点开始，每次选连接"已选集合"和"未选集合"的最小边——类似Dijkstra。</p>
            <p><strong>Kruskal</strong>：从小到大选边，用<strong>并查集</strong>判断是否成环——适合稀疏图。</p>
          `,
          keyPoints: [
            'Prim：维护dist数组（到已选集合的最小边），每轮选最小值加入，O(V²) 或 O((V+E)logV)',
            'Kruskal：对所有边排序，依次选边，用并查集判环，O(E log E)',
            'Prim适合稠密图（邻接矩阵），Kruskal适合稀疏图（邻接表+排序边）',
            'MST的边数 = V - 1',
          ],
          commonErrors: [
            { desc: 'Kruskal中并查集的find/union写错，导致环判断失败', tag: 'error' },
            { desc: 'Prim和Dijkstra代码很像，但dist含义不同', tag: 'warning' },
          ],
          codeExamples: {
            cpp: `// Kruskal + 并查集
struct Edge { int u, v, w; };
bool cmp(Edge a, Edge b) { return a.w < b.w; }

int parent[N];
int find(int x) {
    return parent[x] == x ? x : parent[x] = find(parent[x]);
}
void unite(int a, int b) { parent[find(a)] = find(b); }

int kruskal(vector<Edge>& edges, int n) {
    sort(edges.begin(), edges.end(), cmp);
    for (int i = 0; i < n; i++) parent[i] = i;
    int mst_weight = 0, cnt = 0;
    for (auto& e : edges) {
        if (find(e.u) != find(e.v)) {
            unite(e.u, e.v);
            mst_weight += e.w;
            if (++cnt == n - 1) break;
        }
    }
    return mst_weight;
}`,
            python: `# Kruskal + 并查集
def kruskal(edges, n):
    parent = list(range(n))

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def unite(a, b):
        parent[find(a)] = find(b)

    edges.sort(key=lambda e: e[2])  # 按权值排序
    mst_weight = 0
    cnt = 0
    for u, v, w in edges:
        if find(u) != find(v):
            unite(u, v)
            mst_weight += w
            cnt += 1
            if cnt == n - 1:
                break
    return mst_weight`
          },
          complexity: { time: 'Prim O(V²) 或 O((V+E)log V) | Kruskal O(E log E)', space: 'O(V+E)' }
        }
      ]
    },

    // ==================== 模块4: 查找 ====================
    {
      id: 'search',
      title: '查找算法',
      icon: '🔍',
      topics: [
        {
          id: 'binary-search',
          title: '二分查找',
          difficulty: 3,
          concept: `
            <p>二分查找在<strong>有序数组</strong>中通过不断折半来定位目标，每次排除一半数据。</p>
            <p>关键不在于记住模板，而在于理解<strong>边界条件</strong>：left < right 还是 left <= right？</p>
          `,
          keyPoints: [
            '前提：数组必须有序',
            '标准二分：left=0, right=n-1，while(left<=right)，mid更新为 left=mid+1 / right=mid-1',
            '左边界二分：找第一个 ≥ target 的位置',
            '右边界二分：找最后一个 ≤ target 的位置',
          ],
          commonErrors: [
            { desc: 'left<right vs left<=right：选错了导致漏检或死循环', tag: 'error' },
            { desc: 'mid计算用 (l+r)/2 可能溢出（l和r很大时），用 l+(r-l)/2 更安全', tag: 'warning' },
            { desc: '找边界时 mid 的更新方式不同——left=mid 还是 left=mid+1？', tag: 'error' },
          ],
          codeExamples: {
            cpp: `// 标准二分查找
int binarySearch(vector<int>& arr, int target) {
    int left = 0, right = arr.size() - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] == target)
            return mid;
        else if (arr[mid] < target)
            left = mid + 1;
        else
            right = mid - 1;
    }
    return -1;  // 未找到
}

// 找第一个 >= target 的位置（左边界）
int lowerBound(vector<int>& arr, int target) {
    int left = 0, right = arr.size();
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (arr[mid] >= target)
            right = mid;
        else
            left = mid + 1;
    }
    return left;
}`,
            python: `# 标准二分查找
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# 找第一个 >= target 的位置
def lower_bound(arr, target):
    left, right = 0, len(arr)
    while left < right:
        mid = left + (right - left) // 2
        if arr[mid] >= target:
            right = mid
        else:
            left = mid + 1
    return left`
          },
          complexity: { time: 'O(log n)', space: 'O(1)' }
        },
        {
          id: 'hash',
          title: '哈希表',
          difficulty: 3,
          concept: `
            <p>哈希表通过<strong>哈希函数</strong>将键映射到存储位置，实现 O(1) 平均查找。</p>
            <p>核心问题：<strong>哈希冲突</strong>——不同键映射到同一位置怎么办？两种解决方案：<strong>开放定址法</strong>和<strong>链地址法</strong>。</p>
          `,
          keyPoints: [
            '哈希函数设计：尽量均匀分布，如 取模法 h(k)=k%m（m取素数比较好）',
            '开放定址法：冲突时找下一个空位——线性探测、二次探测、双哈希',
            '链地址法：每个槽位存一个链表，冲突时追加到链表末尾（Java HashMap的做法）',
            '负载因子 α = 元素数 / 槽位数，通常 α<0.75 时性能良好，超过需要扩容',
          ],
          commonErrors: [
            { desc: '负载因子过高未扩容，导致哈希冲突严重、性能退化到O(n)', tag: 'warning' },
            { desc: '开放定址法中删除元素不能直接清空（要设墓碑标记），否则查找链断裂', tag: 'error' },
            { desc: '自定义对象作key时忘记重写hashCode()和equals()', tag: 'error' },
          ],
          codeExamples: {
            cpp: `// C++ STL unordered_map 使用
#include <unordered_map>
unordered_map<string, int> mp;
mp["Alice"] = 95;
mp["Bob"] = 87;
if (mp.find("Alice") != mp.end())
    cout << mp["Alice"];  // 95

// 自定义哈希函数
struct custom_hash {
    size_t operator()(const pair<int,int>& p) const {
        return hash<int>()(p.first) ^ (hash<int>()(p.second) << 1);
    }
};`,
            python: `# Python dict 就是哈希表
mp = {}
mp['Alice'] = 95
mp['Bob'] = 87
print(mp.get('Alice', 0))  # 95
print('Alice' in mp)        # True

# 处理不存在的key
from collections import defaultdict
d = defaultdict(int)
d['key'] += 1  # 不存在的key默认返回0`
          },
          complexity: { time: '平均 O(1) | 最坏 O(n)', space: 'O(n)' }
        }
      ]
    },

    // ==================== 模块5: 排序 ====================
    {
      id: 'sort',
      title: '排序算法',
      icon: '📋',
      topics: [
        {
          id: 'bubble-selection',
          title: '冒泡排序 & 选择排序',
          difficulty: 2,
          concept: `
            <p><strong>冒泡排序</strong>：相邻元素两两比较，大的往后"冒"。每轮确定一个最大值的位置。</p>
            <p><strong>选择排序</strong>：每轮从未排序部分选最小的，放到已排序部分的末尾。</p>
            <p>两种都是 O(n²) 的简单排序，适合小数据量。冒泡稳定，选择不稳定。</p>
          `,
          keyPoints: [
            '冒泡：优化——如果某轮没有交换，说明已有序，可提前结束（最好 O(n)）',
            '选择：每轮只交换一次，比冒泡的交换次数少；但不稳定',
            '稳定性：相同值的元素在排序后相对位置不变 → 冒泡稳定，选择不稳定',
            '冒泡稳定原因：只有在严格大于时才交换；选择不稳定原因：可能跳过中间的同值元素',
          ],
          commonErrors: [
            { desc: '冒泡内层循环边界 j < n-1-i 写成 j < n-1（多比较了已排序部分）', tag: 'warning' },
            { desc: '选择排序中 minIndex 初始化为 i 而不是 0', tag: 'error' },
          ],
          codeExamples: {
            cpp: `// 冒泡排序（带优化）
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {
            if (arr[j] > arr[j + 1]) {  // 严格大于，保证稳定
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;  // 提前结束
    }
}

// 选择排序
void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx])
                minIdx = j;
        }
        swap(arr[i], arr[minIdx]);
    }
}`,
            python: `# 冒泡排序
def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break

# 选择排序
def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]`
          },
          complexity: { time: 'O(n²) | 冒泡最好 O(n) | 选择最好 O(n²)', space: 'O(1)' }
        },
        {
          id: 'insertion',
          title: '插入排序',
          difficulty: 2,
          concept: `
            <p>插入排序像<strong>整理扑克牌</strong>：将每个新元素插入到已排序序列的正确位置。</p>
            <p>对于<strong>基本有序</strong>的小数据量，插入排序是最快的排序算法之一。希尔排序就是在其基础上改进。</p>
          `,
          keyPoints: [
            '稳定排序',
            '最好情况 O(n)（数据已有序），最坏 O(n²)（逆序）',
            '对近乎有序的数据非常高效',
            '常用于高级排序的底层优化（如快排递归到小规模时切换为插入排序）',
          ],
          commonErrors: [
            { desc: '内层循环条件 j>=0 和 arr[j] > key（严格大于保证稳定性）', tag: 'warning' },
            { desc: '忘记保存 key，导致被覆盖后丢失', tag: 'error' },
          ],
          codeExamples: {
            cpp: `void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];       // 保存当前元素
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {  // 严格大于
            arr[j + 1] = arr[j];  // 后移
            j--;
        }
        arr[j + 1] = key;        // 放入正确位置
    }
}`,
            python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]        # 保存当前元素
        j = i - 1
        while j >= 0 and arr[j] > key:  # 严格大于
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key   # 放入正确位置`
          },
          complexity: { time: 'O(n²) | 最好 O(n)', space: 'O(1)' }
        },
        {
          id: 'quicksort',
          title: '快速排序',
          difficulty: 4,
          concept: `
            <p>快速排序基于<strong>分治</strong>思想：选一个pivot（基准），将数组分为"小于pivot"和"大于pivot"两部分，再递归处理两部分。</p>
            <p><strong>核心是partition分区函数</strong>。平均 O(n log n)，但最坏 O(n²)（每次选到最值，退化成冒泡）。</p>
          `,
          keyPoints: [
            'partition：选pivot，用双指针将小于pivot的放左边，大于的放右边',
            'pivot选择策略：随机选/三数取中，避免最坏情况',
            '不稳定排序——partition过程中相同元素可能交换',
            '空间复杂度 O(log n)——递归栈深度',
          ],
          commonErrors: [
            { desc: 'partition中指针停止条件写错，导致无限循环或越界', tag: 'error' },
            { desc: '递归深度过大导致栈溢出——有序数组+固定选最左pivot', tag: 'error' },
            { desc: '把快排的稳定性记反了——快排是不稳定的', tag: 'warning' },
          ],
          codeExamples: {
            cpp: `// 快速排序（Hoare分区）
int partition(vector<int>& arr, int left, int right) {
    int pivot = arr[left];  // 选第一个为基准
    int i = left, j = right;
    while (i < j) {
        while (i < j && arr[j] >= pivot) j--;
        arr[i] = arr[j];
        while (i < j && arr[i] <= pivot) i++;
        arr[j] = arr[i];
    }
    arr[i] = pivot;
    return i;
}

void quickSort(vector<int>& arr, int left, int right) {
    if (left >= right) return;
    int p = partition(arr, left, right);
    quickSort(arr, left, p - 1);
    quickSort(arr, p + 1, right);
}`,
            python: `# 快速排序
def partition(arr, left, right):
    pivot = arr[left]
    i, j = left, right
    while i < j:
        while i < j and arr[j] >= pivot:
            j -= 1
        arr[i] = arr[j]
        while i < j and arr[i] <= pivot:
            i += 1
        arr[j] = arr[i]
    arr[i] = pivot
    return i

def quick_sort(arr, left, right):
    if left >= right:
        return
    p = partition(arr, left, right)
    quick_sort(arr, left, p - 1)
    quick_sort(arr, p + 1, right)`
          },
          complexity: { time: '平均 O(n log n) | 最坏 O(n²)', space: 'O(log n) 递归栈' }
        },
        {
          id: 'mergesort',
          title: '归并排序',
          difficulty: 4,
          concept: `
            <p>归并排序也是分治：将数组<strong>递归地分成两半</strong>，分别排序，然后<strong>合并</strong>两个有序子数组。</p>
            <p>核心是merge合并函数：用两个指针分别遍历两个子数组，小的先放。需要 O(n) 额外空间。</p>
          `,
          keyPoints: [
            '稳定排序——merge时相等元素保持原顺序',
            '时间复杂度始终 O(n log n)，不受输入数据影响',
            '需要 O(n) 额外空间（临时数组）——这是最大缺点',
            '适合外部排序（数据在磁盘上，无法全部加载到内存）',
          ],
          commonErrors: [
            { desc: 'merge时忘记处理某一半先遍历完的情况，导致数组访问越界', tag: 'error' },
            { desc: '临时数组的大小分配错误', tag: 'warning' },
            { desc: '递归划分时 mid 的计算：left + (right - left) / 2', tag: 'warning' },
          ],
          codeExamples: {
            cpp: `// 归并排序
void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> tmp(right - left + 1);
    int i = left, j = mid + 1, k = 0;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j])  // <= 保证稳定性
            tmp[k++] = arr[i++];
        else
            tmp[k++] = arr[j++];
    }
    while (i <= mid) tmp[k++] = arr[i++];
    while (j <= right) tmp[k++] = arr[j++];
    for (int p = 0; p < k; p++)
        arr[left + p] = tmp[p];
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left >= right) return;
    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
}`,
            python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:  # <= 保证稳定性
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`
          },
          complexity: { time: 'O(n log n) 始终', space: 'O(n)' }
        },
        {
          id: 'heapsort',
          title: '堆排序',
          difficulty: 4,
          concept: `
            <p>堆排序利用<strong>大顶堆</strong>的特性：堆顶始终是最大值。交换堆顶和末尾元素，然后向下调整剩余部分。</p>
            <p>堆排序是<strong>选择排序的改进</strong>——用堆来快速找到最大值（O(log n)而非 O(n)）。</p>
          `,
          keyPoints: [
            '第一步：建堆 O(n)（从最后一个非叶子节点 n/2-1 开始逐一下沉）',
            '第二步：依次取堆顶（交换到末尾）+ 下沉调整 O(n log n)',
            '不稳定排序——交换堆顶和末尾可能破坏相同值的相对顺序',
            '就地排序，不需要额外空间（不像归并排序）',
          ],
          commonErrors: [
            { desc: '建堆与排序阶段的heapify函数参数搞混', tag: 'error' },
            { desc: '堆排序是不稳定的！容易误记为稳定', tag: 'warning' },
            { desc: '循环条件：for (i=n-1; i>0; i--) 而不是 i>=0（最后一个是已排好的）', tag: 'warning' },
          ],
          codeExamples: {
            cpp: `// 堆排序
void heapSort(vector<int>& arr) {
    int n = arr.size();
    // 1. 建堆 O(n)
    for (int i = n/2 - 1; i >= 0; i--)
        heapify(arr, n, i);
    // 2. 逐个取堆顶
    for (int i = n - 1; i > 0; i--) {
        swap(arr[0], arr[i]);   // 最大值放到末尾
        heapify(arr, i, 0);     // 调整剩余部分
    }
}

// heapify 同堆一节定义`,
            python: `def heap_sort(arr):
    n = len(arr)
    # 1. 建堆
    for i in range(n // 2 - 1, -1, -1):
        heapify(arr, n, i)
    # 2. 逐个取堆顶
    for i in range(n - 1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]  # 最大值放到末尾
        heapify(arr, i, 0)               # 调整剩余部分

# heapify 同堆一节定义`
          },
          complexity: { time: 'O(n log n) 始终', space: 'O(1) 就地排序' }
        },
        {
          id: 'sort-comparison',
          title: '排序算法总结对比',
          difficulty: 2,
          concept: `
            <p>不同排序算法各有优劣，没有"最好"的排序——要根据数据规模、是否有序、稳定性需求来选择。</p>
          `,
          keyPoints: [
            '小数据 + 基本有序 → 插入排序',
            '大数据 + 需要稳定 → 归并排序',
            '大数据 + 空间有限 + 不需稳定 → 快速排序',
            '大数据 + O(1)空间 + 不需稳定 → 堆排序',
          ],
          comparisonTable: true,  // 特殊标记：渲染对比表格
          codeExamples: {},
          complexity: { time: '综合对比见上表', space: '综合对比见上表' }
        }
      ]
    }
  ],

  // 排序算法总结表
  sortSummary: {
    columns: ['算法', '最好', '平均', '最坏', '空间', '稳定性'],
    rows: [
      ['冒泡排序', 'O(n)', 'O(n²)', 'O(n²)', 'O(1)', '稳定 ✅'],
      ['选择排序', 'O(n²)', 'O(n²)', 'O(n²)', 'O(1)', '不稳定 ❌'],
      ['插入排序', 'O(n)', 'O(n²)', 'O(n²)', 'O(1)', '稳定 ✅'],
      ['快速排序', 'O(n log n)', 'O(n log n)', 'O(n²)', 'O(log n)', '不稳定 ❌'],
      ['归并排序', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', '稳定 ✅'],
      ['堆排序', 'O(n log n)', 'O(n log n)', 'O(n log n)', 'O(1)', '不稳定 ❌'],
      ['希尔排序', 'O(n)', 'O(n^1.3)', 'O(n²)', 'O(1)', '不稳定 ❌'],
    ]
  },

  // 错误分类体系
  errorTypes: [
    {
      category: 'C1: 概念理解错误',
      subtypes: [
        { name: '概念混淆', criteria: '询问术语定义时回答错误', strategy: '给出对比表格，清晰区分相似概念' },
        { name: '性质记错', criteria: '回答与定理/定义不符', strategy: '举例说明 + 反例演示' },
      ]
    },
    {
      category: 'C2: 逻辑推理错误',
      subtypes: [
        { name: '算法步骤遗漏', criteria: '缺少某个关键步骤', strategy: '分步提示，引导补全' },
        { name: '边界条件错误', criteria: '特殊输入处理不对', strategy: '引出边界情况，逐个检查' },
        { name: '递归思维错误', criteria: '递归出口/递推错误', strategy: '画调用栈图，可视化递归过程' },
      ]
    },
    {
      category: 'C3: 代码实现错误',
      subtypes: [
        { name: '指针操作错误', criteria: '链表操作断链', strategy: '画指针变化图，标注每步变化的指针' },
        { name: '循环条件错误', criteria: 'while/for边界错', strategy: '模拟执行，用纸笔跟踪变量变化' },
        { name: '内存管理错误', criteria: 'new/delete不匹配', strategy: '强调配对原则，推荐智能指针' },
      ]
    },
    {
      category: 'C4: 复杂度分析错误',
      subtypes: [
        { name: '复杂度计算错误', criteria: '嵌套循环分析错', strategy: '逐层分析方法，从内向外计算' },
        { name: '空间复杂度遗漏', criteria: '忽略递归栈空间', strategy: '强调递归开销，画递归树估算深度' },
      ]
    }
  ]
};

// 如果使用模块化导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DS_DATA;
}
